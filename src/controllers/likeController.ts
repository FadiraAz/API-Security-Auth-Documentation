import type { Request, Response } from 'express';
import type { IdParam } from '../dtos/common.dto.ts';
import type { CreateLikeInput } from '../dtos/like.dto.ts';
import { getUser } from '../middlewares/auth.ts';
import { getValidated } from '../middlewares/validate.ts';
import { likeService } from '../services/likeService.ts';
import { created, ok } from '../utils/response.ts';

export const likeController = {
  async create(req: Request, res: Response) {
    const body = getValidated<CreateLikeInput>(res, 'body');
    created(res, 'Like berhasil ditambahkan', await likeService.create(body, getUser(req)));
  },

  async remove(req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    await likeService.remove(id, getUser(req));
    ok(res, 'Like berhasil dihapus');
  },
};
