import type { Request, Response } from 'express';
import type { IdParam } from '../dtos/common.dto.ts';
import type { CreateStallInput, ListStallQuery, UpdateStallInput } from '../dtos/stall.dto.ts';
import { getUser } from '../middlewares/auth.ts';
import { getValidated } from '../middlewares/validate.ts';
import { stallService } from '../services/stallService.ts';
import { created, ok } from '../utils/response.ts';

/**
 * Data sudah divalidasi middleware `validate` (dibaca lewat getValidated), dan
 * identitas user dibaca dari token lewat getUser() — tidak pernah dari body.
 */
export const stallController = {
  async list(_req: Request, res: Response) {
    const { rows, meta } = await stallService.list(getValidated<ListStallQuery>(res, 'query'));
    ok(res, 'Daftar kantin berhasil diambil', rows, meta);
  },

  async getById(_req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    ok(res, 'Detail kantin berhasil diambil', await stallService.getById(id));
  },

  async create(req: Request, res: Response) {
    const body = getValidated<CreateStallInput>(res, 'body');
    created(res, 'Kantin berhasil dibuat', await stallService.create(body, getUser(req)));
  },

  async update(req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    const body = getValidated<UpdateStallInput>(res, 'body');
    ok(res, 'Kantin berhasil diperbarui', await stallService.update(id, body, getUser(req)));
  },

  async remove(_req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    await stallService.remove(id);
    ok(res, 'Kantin berhasil dihapus');
  },
};
