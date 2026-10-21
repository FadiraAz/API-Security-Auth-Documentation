import type { ListFlagQuery, UpdateFlagStatusInput } from '../dtos/flag.dto.ts';
import { flagRepository } from '../repositories/flagRepository.ts';
import { notFound } from '../utils/AppError.ts';

export const flagService = {
  list(query: ListFlagQuery) {
    return flagRepository.findAll(query);
  },

  async updateStatus(id: number, input: UpdateFlagStatusInput) {
    if (!(await flagRepository.findById(id))) throw notFound('Flag');
    await flagRepository.updateStatus(id, input.status);
    return (await flagRepository.findById(id))!;
  },
};
