import { Router } from 'express';
import { reviewController } from '../controllers/reviewController.ts';
import { stallController } from '../controllers/stallController.ts';
import { idParamDto } from '../dtos/common.dto.ts';
import { createReviewDto } from '../dtos/review.dto.ts';
import { createStallDto, listStallQueryDto, updateStallDto } from '../dtos/stall.dto.ts';
import { authenticate } from '../middlewares/auth.ts';
import { authorize } from '../middlewares/authorize.ts';
import { validate } from '../middlewares/validate.ts';

export const stallRouter = Router();

// URUTAN middleware: authenticate (401) -> authorize (403) -> validate (400).
// authenticate paling depan, jadi request tanpa token SELALU 401 apa pun isi body-nya
// (aturan validasi tidak bocor ke pengguna anonim).

// PUBLIK
stallRouter.get('/', validate(listStallQueryDto, 'query'), stallController.list);
stallRouter.get('/:id', validate(idParamDto, 'params'), stallController.getById);

// owner, admin
stallRouter.post(
  '/',
  authenticate,
  authorize('owner', 'admin'),
  validate(createStallDto, 'body'),
  stallController.create,
);

// owner (hanya kantin miliknya — dicek di service -> 403), admin
stallRouter.put(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validate(idParamDto, 'params'),
  validate(updateStallDto, 'body'),
  stallController.update,
);

// admin saja
stallRouter.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(idParamDto, 'params'),
  stallController.remove,
);

// LOGIN (semua role): tanpa authorize
stallRouter.post(
  '/:id/reviews',
  authenticate,
  validate(idParamDto, 'params'),
  validate(createReviewDto, 'body'),
  reviewController.createForStall,
);
