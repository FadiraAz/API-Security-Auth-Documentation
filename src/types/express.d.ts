import type { AuthUser } from '../services/tokenService.ts';

/**
 * Augmentasi tipe Express: menambah properti `user` ke `Request` sehingga
 * semua middleware/controller bisa menulis `req.user` tanpa casting.
 *
 * `user` opsional karena pada route publik `authenticate` tidak dijalankan.
 * Pembacaannya selalu lewat `getUser()` yang melempar 401 kalau belum terisi.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
