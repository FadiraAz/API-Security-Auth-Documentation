import type { CreateMenuItemInput, ListMenuItemQuery, UpdateMenuItemInput } from '../dtos/menuItem.dto.ts';
import { menuItemRepository } from '../repositories/menuItemRepository.ts';
import { stallRepository } from '../repositories/stallRepository.ts';
import { notFound } from '../utils/AppError.ts';
import { assertOwnerOrAdmin } from '../utils/ownership.ts';
import { buildMeta } from '../utils/response.ts';
import type { AuthUser } from './tokenService.ts';

const FORBIDDEN_MSG = 'Kamu hanya bisa mengelola menu milik kantinmu sendiri';

/** Pastikan kantin ada, lalu pastikan user adalah pemiliknya (atau admin). */
async function assertCanManageStall(stallId: number, user: AuthUser) {
  const stall = await stallRepository.findById(stallId);
  if (!stall) throw notFound('Kantin');
  assertOwnerOrAdmin(stall.owner_id, user, FORBIDDEN_MSG);
}

export const menuItemService = {
  async list(query: ListMenuItemQuery) {
    const { rows, total } = await menuItemRepository.findAll(query);
    return { rows, meta: buildMeta(query.page, query.limit, total) };
  },

  async getById(id: number) {
    const item = await menuItemRepository.findById(id);
    if (!item) throw notFound('Menu');
    return item;
  },

  async create(input: CreateMenuItemInput, user: AuthUser) {
    await assertCanManageStall(input.stall_id, user);
    const id = await menuItemRepository.create(input);
    return this.getById(id);
  },

  async update(id: number, input: UpdateMenuItemInput, user: AuthUser) {
    const item = await this.getById(id);
    await assertCanManageStall(item.stall.id, user);

    const data = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    await menuItemRepository.update(id, data);
    return this.getById(id);
  },

  async remove(id: number, user: AuthUser) {
    const item = await this.getById(id);
    await assertCanManageStall(item.stall.id, user);
    await menuItemRepository.delete(id);
  },
};
