import { Router } from 'express';
import { flagController } from '../controllers/flagController.ts';
import { idParamDto } from '../dtos/common.dto.ts';
import { listFlagQueryDto, updateFlagStatusDto } from '../dtos/flag.dto.ts';
import { authenticate } from '../middlewares/auth.ts';
import { authorize } from '../middlewares/authorize.ts';
import { validate } from '../middlewares/validate.ts';

export const flagRouter = Router();

// Moderasi laporan review: admin saja.
flagRouter.get('/', authenticate, authorize('admin'), validate(listFlagQueryDto, 'query'), flagController.list);
flagRouter.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(idParamDto, 'params'),
  validate(updateFlagStatusDto, 'body'),
  flagController.updateStatus,
);
