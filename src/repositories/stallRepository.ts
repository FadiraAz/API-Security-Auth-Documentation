import { and, asc, count, desc, eq, gte, like, or, sql } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { reviews, stalls } from '../db/schema.ts';
import type { ListStallQuery } from '../dtos/stall.dto.ts';

const sortColumns = {
  name: stalls.name,
  avg_rating: stalls.avg_rating,
  review_count: stalls.review_count,
  created_at: stalls.created_at,
} as const;

export const stallRepository = {
  /** Filtering + sorting + pagination (OFFSET ... FETCH NEXT). */
  async findAll(q: ListStallQuery) {
    const db = await getDb();

    const where = and(
      q.category ? eq(stalls.category, q.category) : undefined,
      q.location ? like(stalls.location, `%${q.location}%`) : undefined,
      q.owner_id ? eq(stalls.owner_id, q.owner_id) : undefined,
      q.min_rating !== undefined ? gte(stalls.avg_rating, q.min_rating) : undefined,
      q.search ? or(like(stalls.name, `%${q.search}%`), like(stalls.description, `%${q.search}%`)) : undefined,
    );

    const sortCol = sortColumns[q.sort_by];
    const orderBy = q.order === 'asc' ? asc(sortCol) : desc(sortCol);

    const rows = await db
      .select()
      .from(stalls)
      .where(where)
      // id sebagai tie-breaker supaya urutan antar halaman stabil
      .orderBy(orderBy, asc(stalls.id))
      .offset((q.page - 1) * q.limit)
      .fetch(q.limit);

    const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(stalls).where(where);

    return { rows, total: Number(total) };
  },

  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select().from(stalls).where(eq(stalls.id, id));
    return rows[0];
  },

  async create(data: typeof stalls.$inferInsert) {
    const db = await getDb();
    const [row] = await db.insert(stalls).output({ id: stalls.id }).values(data);
    return row!.id;
  },

  async update(id: number, data: Partial<typeof stalls.$inferInsert>) {
    const db = await getDb();
    await db.update(stalls).set(data).where(eq(stalls.id, id));
  },

  async delete(id: number) {
    const db = await getDb();
    await db.delete(stalls).where(eq(stalls.id, id));
  },

  /** Hitung ulang avg_rating & review_count dari tabel REVIEWS. */
  async recalcRating(stallId: number) {
    const db = await getDb();
    const [agg] = await db
      .select({
        // CAST supaya AVG tidak dibulatkan sebagai integer oleh SQL Server
        avg: sql<number>`ISNULL(AVG(CAST(${reviews.rating} AS DECIMAL(5,2))), 0)`.mapWith(Number),
        cnt: count(),
      })
      .from(reviews)
      .where(eq(reviews.stall_id, stallId));

    await db
      .update(stalls)
      .set({
        avg_rating: Math.round((agg?.avg ?? 0) * 100) / 100,
        review_count: Number(agg?.cnt ?? 0),
      })
      .where(eq(stalls.id, stallId));
  },
};
