import type { CreateReviewInput, ListReviewQuery } from '../dtos/review.dto.ts';
import { reviewRepository } from '../repositories/reviewRepository.ts';
import { stallRepository } from '../repositories/stallRepository.ts';
import { conflict, notFound } from '../utils/AppError.ts';
import { assertOwnerOrAdmin } from '../utils/ownership.ts';
import { buildMeta } from '../utils/response.ts';
import type { AuthUser } from './tokenService.ts';

export const reviewService = {
  async list(query: ListReviewQuery) {
    const { rows, total } = await reviewRepository.findAll(query);
    return { rows, meta: buildMeta(query.page, query.limit, total) };
  },

  async getById(id: number) {
    const review = await reviewRepository.findById(id);
    if (!review) throw notFound('Review');
    return review;
  },

  /**
   * `userId` datang dari token (diambil controller dari req.user), BUKAN dari body,
   * dan `stallId` dari path. Service tidak pernah mempercayai client soal "siapa yang menulis".
   */
  async create(stallId: number, userId: number, input: CreateReviewInput) {
    if (!(await stallRepository.findById(stallId))) throw notFound('Kantin');
    if (await reviewRepository.findByUserAndStall(userId, stallId)) {
      throw conflict('Kamu sudah mereview kantin tersebut');
    }

    const id = await reviewRepository.create({
      stall_id: stallId,
      user_id: userId,
      rating: input.rating,
      comment: input.comment ?? null,
    });
    await stallRepository.recalcRating(stallId); // jaga avg_rating & review_count tetap sinkron
    return this.getById(id);
  },

  /** Penulis review boleh menghapus review-nya sendiri; admin boleh menghapus review siapa pun. */
  async remove(id: number, user: AuthUser) {
    const review = await this.getById(id);
    assertOwnerOrAdmin(review.user.id, user, 'Kamu hanya bisa menghapus review milikmu sendiri');

    await reviewRepository.delete(id);
    await stallRepository.recalcRating(review.stall_id);
  },
};
