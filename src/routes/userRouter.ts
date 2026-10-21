import { Router } from 'express';
import { userController } from '../controllers/userController.ts';
import { createUserDto, listUserQueryDto } from '../dtos/user.dto.ts';
import { authenticate } from '../middlewares/auth.ts';
import { authorize } from '../middlewares/authorize.ts';
import { validate } from '../middlewares/validate.ts';

export const userRouter = Router();

// Manajemen user: admin saja (pendaftaran mandiri lewat POST /auth/register).
userRouter.get('/', authenticate, authorize('admin'), validate(listUserQueryDto, 'query'), userController.list);
userRouter.post('/', authenticate, authorize('admin'), validate(createUserDto, 'body'), userController.create);
