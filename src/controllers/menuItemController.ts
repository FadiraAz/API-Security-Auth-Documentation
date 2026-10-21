import type { Request, Response } from 'express';
import type { IdParam } from '../dtos/common.dto.ts';
import type { CreateMenuItemInput, ListMenuItemQuery, UpdateMenuItemInput } from '../dtos/menuItem.dto.ts';
import { getUser } from '../middlewares/auth.ts';
import { getValidated } from '../middlewares/validate.ts';
import { menuItemService } from '../services/menuItemService.ts';
import { created, ok } from '../utils/response.ts';

export const menuItemController = {
  async list(_req: Request, res: Response) {
    const { rows, meta } = await menuItemService.list(getValidated<ListMenuItemQuery>(res, 'query'));
    ok(res, 'Daftar menu berhasil diambil', rows, meta);
  },

  async getById(_req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    ok(res, 'Detail menu berhasil diambil', await menuItemService.getById(id));
  },

  async create(req: Request, res: Response) {
    const body = getValidated<CreateMenuItemInput>(res, 'body');
    created(res, 'Menu berhasil dibuat', await menuItemService.create(body, getUser(req)));
  },

  async update(req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    const body = getValidated<UpdateMenuItemInput>(res, 'body');
    ok(res, 'Menu berhasil diperbarui', await menuItemService.update(id, body, getUser(req)));
  },

  async remove(req: Request, res: Response) {
    const { id } = getValidated<IdParam>(res, 'params');
    await menuItemService.remove(id, getUser(req));
    ok(res, 'Menu berhasil dihapus');
  },
};
