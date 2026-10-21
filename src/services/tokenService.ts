import jwt, { type SignOptions } from 'jsonwebtoken';
import { userRoles } from '../db/schema.ts';

export type UserRole = (typeof userRoles)[number];

/** Bentuk `req.user`: identitas yang dibawa token, diisi middleware `authenticate`. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Rahasia penanda tangan JWT dibaca dari .env. Sengaja TANPA nilai default:
 * kalau lupa diset, server harus gagal dengan pesan jelas, bukan diam-diam
 * menandatangani token dengan string tebakan.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET belum diset di .env');
  return secret;
}

export const getJwtExpiresIn = (): string => process.env.JWT_EXPIRES_IN ?? '2h';

/**
 * Membuat token JWT. JANGAN pernah menaruh password di payload: payload hanya
 * di-encode (base64url), bukan dienkripsi, jadi bisa dibaca siapa pun pemegang token.
 */
export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: String(user.id), name: user.name, email: user.email, role: user.role },
    getJwtSecret(),
    { algorithm: 'HS256', expiresIn: getJwtExpiresIn() as SignOptions['expiresIn'] },
  );
}

/**
 * Memverifikasi signature + masa berlaku token, lalu mengembalikan AuthUser.
 * Melempar error kalau tidak valid -> middleware `authenticate` mengubahnya jadi 401.
 */
export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
  if (typeof payload === 'string') throw new jwt.JsonWebTokenError('Payload token bukan objek JSON');

  const id = Number(payload.sub);
  const { name, email, role } = payload as { name?: string; email?: string; role?: string };

  if (!Number.isInteger(id) || !name || !email || !role || !(userRoles as readonly string[]).includes(role)) {
    throw new jwt.JsonWebTokenError('Payload token tidak memuat data user yang lengkap');
  }
  return { id, name, email, role: role as UserRole };
}
