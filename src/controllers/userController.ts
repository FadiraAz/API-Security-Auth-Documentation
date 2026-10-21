import type { Request, Response } from 'express';
import type { CreateUserInput, ListUserQuery } from '../dtos/user.dto.ts';
import { getValidated } from '../middlewares/validate.ts';
import { userService } from '../services/userService.ts';
import { created, ok } from '../utils/response.ts';

export const userController = {
  async list(_req: Request, res: Response) {
    ok(res, 'Daftar user berhasil diambil', await userService.list(getValidated<ListUserQuery>(res, 'query')));
  },

  async create(_req: Request, res: Response) {
    created(res, 'User berhasil dibuat', await userService.create(getValidated<CreateUserInput>(res, 'body')));
  },
};
