import type { CreateAuditLogInput, ListAuditLogQuery } from '../dtos/auditLog.dto.ts';
import { auditLogRepository } from '../repositories/auditLogRepository.ts';
import { buildMeta } from '../utils/response.ts';
import type { AuthUser } from './tokenService.ts';

export const auditLogService = {
  async list(query: ListAuditLogQuery) {
    const { rows, total } = await auditLogRepository.findAll(query);
    return { rows, meta: buildMeta(query.page, query.limit, total) };
  },

  /** Pelaku (`user_id`) dicatat dari token, bukan dari body. */
  async create(input: CreateAuditLogInput, user: AuthUser) {
    const metadata =
      input.metadata === undefined
        ? null
        : typeof input.metadata === 'string'
          ? input.metadata
          : JSON.stringify(input.metadata);

    const id = await auditLogRepository.create({
      user_id: user.id,
      action: input.action,
      target_table: input.target_table,
      target_id: input.target_id,
      metadata,
    });
    return (await auditLogRepository.findById(id))!;
  },
};
