import { z } from 'zod';
import { requiredError, strictBody } from './common.dto.ts';

/** Body POST /likes. SENGAJA tanpa `user_id`: yang me-like adalah user dari token. */
export const createLikeDto = strictBody({
  review_id: z
    .number({ error: requiredError('review_id', 'angka') })
    .int('review_id harus bilangan bulat')
    .positive('review_id harus lebih dari 0'),
});

export type CreateLikeInput = z.infer<typeof createLikeDto>;
