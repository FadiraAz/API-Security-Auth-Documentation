import type { AuthUser } from '../services/tokenService.ts';
import { forbidden } from './AppError.ts';

/**
 * Otorisasi tingkat OBJEK: role saja belum cukup, resource-nya juga harus milik user tersebut.
 * Admin boleh semuanya; selain admin, `ownerId` resource harus sama dengan id user di token.
 * Tidak cocok -> 403 (user sudah login/valid, tapi bukan haknya).
 */
export function assertOwnerOrAdmin(ownerId: number, user: AuthUser, message: string): void {
  if (user.role === 'admin') return;
  if (ownerId !== user.id) throw forbidden(message);
}
