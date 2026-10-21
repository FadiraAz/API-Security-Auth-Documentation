import { Router } from 'express';
import { reviewController } from '../controllers/reviewController.ts';
import { idParamDto } from '../dtos/common.dto.ts';
import { listReviewQueryDto } from '../dtos/review.dto.ts';
import { authenticate } from '../middlewares/auth.ts';
import { validate } from '../middlewares/validate.ts';

export const reviewRouter = Router();

// Membuat review lewat POST /stalls/:id/reviews (lihat stallRouter).

// PUBLIK
reviewRouter.get('/', validate(listReviewQueryDto, 'query'), reviewController.list);
reviewRouter.get('/:id', validate(idParamDto, 'params'), reviewController.getById);

// LOGIN: penulis review (atau admin) — kepemilikan dicek di service -> 403
reviewRouter.delete('/:id', authenticate, validate(idParamDto, 'params'), reviewController.remove);
