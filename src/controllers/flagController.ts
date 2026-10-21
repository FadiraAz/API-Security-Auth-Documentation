import type { Request, Response } from 'express';
import type { IdParam } from '../dtos/common.dto.ts';
import type { ListFlagQuery, UpdateFlagStatusInput } from '../dtos/flag.dto.ts';
import { getValidated } from '../middlewares/validate.ts';
import { flagService } from '../services/flagService.ts';
import { ok } from '../utils/response.ts';

export const flagController = {
  async list(_req: Request, res: Response) {
    ok(res, 'Daftar flag berhasil diambil', await flagService.list(getValidated<ListFlagQuery>(res, 'query')));
  },

  async updateStatus(_req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    const body = getValidated<UpdateFlagStatusInput>(res, 'body');
    ok(res, 'Status flag berhasil diperbarui', await flagService.updateStatus(id, body));
  },
};
