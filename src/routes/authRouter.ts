import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { loginDto, registerDto } from '../dtos/auth.dto.ts';
import { authenticate } from '../middlewares/auth.ts';
import { validate } from '../middlewares/validate.ts';

export const authRouter = Router();

// PUBLIK: tidak boleh ada authenticate di sini — token justru dibuat oleh endpoint login.
authRouter.post('/register', validate(registerDto, 'body'), authController.register);
authRouter.post('/login', validate(loginDto, 'body'), authController.login);

// LOGIN (semua role): cukup token valid.
authRouter.get('/me', authenticate, authController.me);
