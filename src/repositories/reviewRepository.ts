import { and, count, desc, eq, gte } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { likes, reviews, users } from '../db/schema.ts';
import type { ListReviewQuery } from '../dtos/review.dto.ts';

// Kolom hasil JOIN dengan USERS (tanpa email/password)
const withUser = {
  id: reviews.id,
  stall_id: reviews.stall_id,
  rating: reviews.rating,
  comment: reviews.comment,
  like_count: reviews.like_count,
  created_at: reviews.created_at,
  updated_at: reviews.updated_at,
  user: { id: users.id, name: users.name },
};

export const reviewRepository = {
  async findAll(q: ListReviewQuery) {
    const db = await getDb();
    const where = and(
      q.stall_id ? eq(reviews.stall_id, q.stall_id) : undefined,
      q.user_id ? eq(reviews.user_id, q.user_id) : undefined,
      q.min_rating ? gte(reviews.rating, q.min_rating) : undefined,
    );

    const rows = await db
      .select(withUser)
      .from(reviews)
      .innerJoin(users, eq(reviews.user_id, users.id))
      .where(where)
      .orderBy(desc(reviews.created_at), desc(reviews.id))
      .offset((q.page - 1) * q.limit)
      .fetch(q.limit);

    const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(reviews).where(where);
    return { rows, total: Number(total) };
  },

  async findById(id: number) {
    const db = await getDb();
    const rows = await db
      .select(withUser)
      .from(reviews)
      .innerJoin(users, eq(reviews.user_id, users.id))
      .where(eq(reviews.id, id));
    return rows[0];
  },

  async findByUserAndStall(userId: number, stallId: number) {
    const db = await getDb();
    const rows = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.user_id, userId), eq(reviews.stall_id, stallId)));
    return rows[0];
  },

  async create(data: typeof reviews.$inferInsert) {
    const db = await getDb();
    const [row] = await db.insert(reviews).output({ id: reviews.id }).values(data);
    return row!.id;
  },

  async delete(id: number) {
    const db = await getDb();
    await db.delete(reviews).where(eq(reviews.id, id));
  },

  async recalcLikeCount(reviewId: number) {
    const db = await getDb();
    const [{ total } = { total: 0 }] = await db
      .select({ total: count() })
      .from(likes)
      .where(eq(likes.review_id, reviewId));
    await db.update(reviews).set({ like_count: Number(total) }).where(eq(reviews.id, reviewId));
  },
};
