import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { forbidden } from '../utils/AppError.ts';
import { getUser } from './auth.ts';
import type { UserRole } from '../services/tokenService.ts';

/**
 * Middleware OTORISASI berparameter -> menjawab "bolehkah kamu?".
 *
 *   authenticate, authorize('admin')            -> hanya admin
 *   authenticate, authorize('owner', 'admin')   -> owner atau admin
 *
 * Wajib dipasang SETELAH `authenticate`. Role tidak cocok -> 403.
 */
export function authorize(...allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (allowedRoles.length === 0) {
      return next(new Error('authorize() harus menerima minimal satu role'));
    }

    // getUser melempar 401 kalau urutan middleware terbalik (authenticate belum jalan).
    const user = getUser(req);

    if (!allowedRoles.includes(user.role)) {
      return next(forbidden(`Endpoint ini hanya untuk role: ${allowedRoles.join(', ')}`));
    }
    return next();
  };
}
