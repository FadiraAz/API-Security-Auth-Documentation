import { Router } from 'express';
import { auditLogController } from '../controllers/auditLogController.ts';
import { createAuditLogDto, listAuditLogQueryDto } from '../dtos/auditLog.dto.ts';
import { authenticate } from '../middlewares/auth.ts';
import { authorize } from '../middlewares/authorize.ts';
import { validate } from '../middlewares/validate.ts';

export const auditLogRouter = Router();

// Audit log: admin saja. `user_id` pelaku diambil dari token.
auditLogRouter.get('/', authenticate, authorize('admin'), validate(listAuditLogQueryDto, 'query'), auditLogController.list);
auditLogRouter.post('/', authenticate, authorize('admin'), validate(createAuditLogDto, 'body'), auditLogController.create);
