import type { Request, Response } from 'express';
import type { CreateAuditLogInput, ListAuditLogQuery } from '../dtos/auditLog.dto.ts';
import { getUser } from '../middlewares/auth.ts';
import { getValidated } from '../middlewares/validate.ts';
import { auditLogService } from '../services/auditLogService.ts';
import { created, ok } from '../utils/response.ts';

export const auditLogController = {
  async list(_req: Request, res: Response) {
    const { rows, meta } = await auditLogService.list(getValidated<ListAuditLogQuery>(res, 'query'));
    ok(res, 'Daftar audit log berhasil diambil', rows, meta);
  },

  async create(req: Request, res: Response) {
    const body = getValidated<CreateAuditLogInput>(res, 'body');
    created(res, 'Audit log berhasil dicatat', await auditLogService.create(body, getUser(req)));
  },
};
