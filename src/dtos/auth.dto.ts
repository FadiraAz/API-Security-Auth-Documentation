import { z } from 'zod';
import { requiredError, strictBody } from './common.dto.ts';

// Field dasar yang dipakai ulang (register, login, dan POST /users oleh admin).
// bcrypt hanya memproses 72 byte pertama, jadi password dibatasi maksimal 72.
export const nameField = z
  .string({ error: requiredError('name') })
  .trim()
  .min(3, 'name minimal 3 karakter')
  .max(100, 'name maksimal 100 karakter');

export const passwordField = z
  .string({ error: requiredError('password') })
  .min(8, 'password minimal 8 karakter')
  .max(72, 'password maksimal 72 karakter');

const emailBase = z.string({ error: requiredError('email') }).trim().toLowerCase();

export const emailField = emailBase
  .email('format email tidak valid')
  .max(150, 'email maksimal 150 karakter');

/**
 * Register: SENGAJA tanpa field `role`. Role diberikan server (selalu 'customer').
 * Kalau role diterima dari body, siapa pun bisa mendaftar sebagai admin.
 */
export const registerDto = strictBody({
  name: nameField,
  email: emailField,
  password: passwordField,
});

export const loginDto = strictBody({
  email: emailBase.email('format email tidak valid'),
  // Login cukup dicek tidak kosong; aturan panjang hanya berlaku saat register.
  password: z.string({ error: requiredError('password') }).min(1, 'password wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerDto>;
export type LoginInput = z.infer<typeof loginDto>;
