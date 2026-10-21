import type { Request, Response } from 'express';
import type { LoginInput, RegisterInput } from '../dtos/auth.dto.ts';
import { getUser } from '../middlewares/auth.ts';
import { getValidated } from '../middlewares/validate.ts';
import { authService } from '../services/authService.ts';
import { created, ok } from '../utils/response.ts';

export const authController = {
  async register(_req: Request, res: Response) {
    const user = await authService.register(getValidated<RegisterInput>(res, 'body'));
    created(res, 'Registrasi berhasil', { user });
  },

  async login(_req: Request, res: Response) {
    ok(res, 'Login berhasil', await authService.login(getValidated<LoginInput>(res, 'body')));
  },

  /** Identitas diambil dari token (tanpa query database). */
  async me(req: Request, res: Response) {
    ok(res, 'Data user dari token', getUser(req));
  },
};
