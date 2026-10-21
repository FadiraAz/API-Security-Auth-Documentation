import type { Request, Response } from 'express';
import type { IdParam } from '../dtos/common.dto.ts';
import type { CreateReviewInput, ListReviewQuery } from '../dtos/review.dto.ts';
import { getUser } from '../middlewares/auth.ts';
import { getValidated } from '../middlewares/validate.ts';
import { reviewService } from '../services/reviewService.ts';
import { created, ok } from '../utils/response.ts';

export const reviewController = {
  async list(_req: Request, res: Response) {
    const { rows, meta } = await reviewService.list(getValidated<ListReviewQuery>(res, 'query'));
    ok(res, 'Daftar review berhasil diambil', rows, meta);
  },

  async getById(_req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    ok(res, 'Detail review berhasil diambil', await reviewService.getById(id));
  },

  /** POST /stalls/:id/reviews — kantin dari path, penulis dari TOKEN (bukan body). */
  async createForStall(req: Request, res: Response) {
    const { id: stallId } = getValidated<IdParam>(res, 'params');
    const body = getValidated<CreateReviewInput>(res, 'body');
    const { id: userId } = getUser(req);
    created(res, 'Review berhasil dibuat', await reviewService.create(stallId, userId, body));
  },

  async remove(req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    await reviewService.remove(id, getUser(req));
    ok(res, 'Review berhasil dihapus');
  },
};
