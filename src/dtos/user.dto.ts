import { z } from 'zod';
import { userRoles } from '../db/schema.ts';
import { emailField, nameField, passwordField } from './auth.dto.ts';
import { strictBody } from './common.dto.ts';

/** Dipakai admin untuk membuat akun dengan role tertentu (register publik selalu 'customer'). */
export const createUserDto = strictBody({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: z.enum(userRoles, { error: `role harus salah satu dari: ${userRoles.join(', ')}` }).default('customer'),
});

export const listUserQueryDto = z.object({
  role: z.enum(userRoles, { error: `role harus salah satu dari: ${userRoles.join(', ')}` }).optional(),
});

export type CreateUserInput = z.infer<typeof createUserDto>;
export type ListUserQuery = z.infer<typeof listUserQueryDto>;
