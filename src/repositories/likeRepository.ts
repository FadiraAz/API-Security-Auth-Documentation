import { and, eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { likes } from '../db/schema.ts';

export const likeRepository = {
  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select().from(likes).where(eq(likes.id, id));
    return rows[0];
  },

  async findByReviewAndUser(reviewId: number, userId: number) {
    const db = await getDb();
    const rows = await db
      .select({ id: likes.id })
      .from(likes)
      .where(and(eq(likes.review_id, reviewId), eq(likes.user_id, userId)));
    return rows[0];
  },

  async create(data: typeof likes.$inferInsert) {
    const db = await getDb();
    const [row] = await db.insert(likes).output({ id: likes.id }).values(data);
    return row!.id;
  },

  async delete(id: number) {
    const db = await getDb();
    await db.delete(likes).where(eq(likes.id, id));
  },
};
