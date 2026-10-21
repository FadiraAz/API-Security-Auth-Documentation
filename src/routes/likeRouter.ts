import { Router } from 'express';
import { likeController } from '../controllers/likeController.ts';
import { idParamDto } from '../dtos/common.dto.ts';
import { createLikeDto } from '../dtos/like.dto.ts';
import { authenticate } from '../middlewares/auth.ts';
import { validate } from '../middlewares/validate.ts';

export const likeRouter = Router();

// LOGIN (semua role). `user_id` diambil dari token.
likeRouter.post('/', authenticate, validate(createLikeDto, 'body'), likeController.create);
// pemilik like (atau admin) — dicek di service -> 403
likeRouter.delete('/:id', authenticate, validate(idParamDto, 'params'), likeController.remove);
