import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { verifyToken, type AuthUser } from '../services/tokenService.ts';
import { unauthorized } from '../utils/AppError.ts';

const BEARER_PREFIX = 'Bearer ';

/** Ambil token dari header `Authorization: Bearer <token>`; null kalau tidak ada / salah skema. */
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith(BEARER_PREFIX)) return null;
  const token = header.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}

/**
 * Middleware AUTENTIKASI -> menjawab "siapa kamu?".
 * Token valid -> isi `req.user`. Token tidak ada / rusak / kedaluwarsa -> 401.
 */
export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next(unauthorized('Header Authorization dengan token Bearer wajib dikirim'));

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    // Detail ("expired" vs "signature salah") sengaja tidak dibocorkan ke client.
    return next(unauthorized());
  }
};

/** Pembaca `req.user` yang aman: melempar 401 (bukan `undefined`) kalau authenticate lupa dipasang. */
export function getUser(req: Request): AuthUser {
  if (!req.user) throw unauthorized('Endpoint ini harus dipakai setelah middleware authenticate');
  return req.user;
}
