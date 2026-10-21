import type { CreateStallInput, ListStallQuery, UpdateStallInput } from '../dtos/stall.dto.ts';
import { stallRepository } from '../repositories/stallRepository.ts';
import { notFound } from '../utils/AppError.ts';
import { assertOwnerOrAdmin } from '../utils/ownership.ts';
import { buildMeta } from '../utils/response.ts';
import type { AuthUser } from './tokenService.ts';

export const stallService = {
  async list(query: ListStallQuery) {
    const { rows, total } = await stallRepository.findAll(query);
    return { rows, meta: buildMeta(query.page, query.limit, total) };
  },

  async getById(id: number) {
    const stall = await stallRepository.findById(id);
    if (!stall) throw notFound('Kantin');
    return stall;
  },

  /**
   * `owner_id` TIDAK pernah datang dari body — pemilik kantin selalu user di token,
   * sehingga client tidak bisa membuat kantin atas nama orang lain.
   */
  async create(input: CreateStallInput, user: AuthUser) {
    const id = await stallRepository.create({ ...input, owner_id: user.id });
    return (await stallRepository.findById(id))!;
  },

  async update(id: number, input: UpdateStallInput, user: AuthUser) {
    const stall = await this.getById(id); // 404 kalau tidak ada
    // Owner hanya boleh mengubah kantin MILIKNYA; admin boleh semua. Selain itu -> 403.
    assertOwnerOrAdmin(stall.owner_id, user, 'Kamu hanya bisa mengubah kantin milikmu sendiri');

    // buang key yang undefined supaya tidak menimpa kolom lain
    const data = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    await stallRepository.update(id, data);
    return (await stallRepository.findById(id))!;
  },

  /** Hanya admin (dijaga di route lewat authorize('admin')). */
  async remove(id: number) {
    await this.getById(id);
    await stallRepository.delete(id); // menu, review, like, flag ikut terhapus (ON DELETE CASCADE)
  },
};
