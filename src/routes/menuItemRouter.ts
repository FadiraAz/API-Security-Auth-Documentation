import { Router } from 'express';
import { menuItemController } from '../controllers/menuItemController.ts';
import { idParamDto } from '../dtos/common.dto.ts';
import { createMenuItemDto, listMenuItemQueryDto, updateMenuItemDto } from '../dtos/menuItem.dto.ts';
import { authenticate } from '../middlewares/auth.ts';
import { authorize } from '../middlewares/authorize.ts';
import { validate } from '../middlewares/validate.ts';

export const menuItemRouter = Router();

// PUBLIK (menu boleh dilihat tamu)
menuItemRouter.get('/', validate(listMenuItemQueryDto, 'query'), menuItemController.list);
menuItemRouter.get('/:id', validate(idParamDto, 'params'), menuItemController.getById);

// owner (hanya menu kantin miliknya — dicek di service -> 403), admin
menuItemRouter.post(
  '/',
  authenticate,
  authorize('owner', 'admin'),
  validate(createMenuItemDto, 'body'),
  menuItemController.create,
);
menuItemRouter.put(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validate(idParamDto, 'params'),
  validate(updateMenuItemDto, 'body'),
  menuItemController.update,
);
menuItemRouter.delete(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validate(idParamDto, 'params'),
  menuItemController.remove,
);
