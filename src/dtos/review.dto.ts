import { z } from 'zod';
import { optionalId, optionalText, paginationDto, requiredError, strictBody } from './common.dto.ts';

/**
 * Body POST /stalls/:id/reviews. SENGAJA tanpa `user_id` dan `stall_id`:
 * penulis diambil dari token, kantin diambil dari path `:id`.
 */
export const createReviewDto = strictBody({
  rating: z
    .number({ error: requiredError('rating', 'angka') })
    .int('rating harus bilangan bulat')
    .min(1, 'rating minimal 1')
    .max(5, 'rating maksimal 5'),
  comment: optionalText('comment', 1000),
});

export const listReviewQueryDto = paginationDto.extend({
  stall_id: optionalId('stall_id'),
  user_id: optionalId('user_id'),
  min_rating: z.coerce
    .number({ error: 'min_rating harus berupa angka' })
    .int('min_rating harus bilangan bulat')
    .min(1, 'min_rating minimal 1')
    .max(5, 'min_rating maksimal 5')
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewDto>;
export type ListReviewQuery = z.infer<typeof listReviewQueryDto>;
