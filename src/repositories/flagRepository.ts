import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { flags, reviews, users } from '../db/schema.ts';

// JOIN ke REVIEWS (isi komentar) dan USERS (nama pelapor)
const detail = {
  id: flags.id,
  reason: flags.reason,
  status: flags.status,
  created_at: flags.created_at,
  review: { id: reviews.id, rating: reviews.rating, comment: reviews.comment },
  reporter: { id: users.id, name: users.name },
};

export const flagRepository = {
  async findAll(filter: { status?: (typeof flags.$inferSelect)['status']; review_id?: number }) {
    const db = await getDb();
    return db
      .select(detail)
      .from(flags)
      .innerJoin(reviews, eq(flags.review_id, reviews.id))
      .innerJoin(users, eq(flags.reported_by, users.id))
      .where(
        and(
          filter.status ? eq(flags.status, filter.status) : undefined,
          filter.review_id ? eq(flags.review_id, filter.review_id) : undefined,
        ),
      )
      .orderBy(desc(flags.created_at), desc(flags.id));
  },

  async findById(id: number) {
    const db = await getDb();
    const rows = await db
      .select(detail)
      .from(flags)
      .innerJoin(reviews, eq(flags.review_id, reviews.id))
      .innerJoin(users, eq(flags.reported_by, users.id))
      .where(eq(flags.id, id));
    return rows[0];
  },

  async updateStatus(id: number, status: (typeof flags.$inferSelect)['status']) {
    const db = await getDb();
    await db.update(flags).set({ status }).where(eq(flags.id, id));
  },
};
