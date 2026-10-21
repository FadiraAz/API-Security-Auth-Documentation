import type { CreateLikeInput } from '../dtos/like.dto.ts';
import { likeRepository } from '../repositories/likeRepository.ts';
import { reviewRepository } from '../repositories/reviewRepository.ts';
import { conflict, notFound } from '../utils/AppError.ts';
import { assertOwnerOrAdmin } from '../utils/ownership.ts';
import type { AuthUser } from './tokenService.ts';

export const likeService = {
  /** `user_id` = user di token, bukan dari body. */
  async create(input: CreateLikeInput, user: AuthUser) {
    if (!(await reviewRepository.findById(input.review_id))) throw notFound('Review');
    if (await likeRepository.findByReviewAndUser(input.review_id, user.id)) {
      throw conflict('Kamu sudah menyukai review tersebut');
    }

    const id = await likeRepository.create({ review_id: input.review_id, user_id: user.id });
    await reviewRepository.recalcLikeCount(input.review_id);
    return (await likeRepository.findById(id))!;
  },

  /** Hanya pemilik like (atau admin) yang boleh membatalkannya. */
  async remove(id: number, user: AuthUser) {
    const like = await likeRepository.findById(id);
    if (!like) throw notFound('Like');
    assertOwnerOrAdmin(like.user_id, user, 'Kamu hanya bisa membatalkan like milikmu sendiri');

    await likeRepository.delete(id);
    await reviewRepository.recalcLikeCount(like.review_id);
  },
};
