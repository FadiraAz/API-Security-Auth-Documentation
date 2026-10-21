import bcrypt from 'bcryptjs';
import type { LoginInput, RegisterInput } from '../dtos/auth.dto.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { conflict, unauthorized } from '../utils/AppError.ts';
import { getJwtExpiresIn, signToken, type AuthUser } from './tokenService.ts';

/** Biaya bcrypt (jumlah iterasi). Makin besar = makin lambat & makin aman. */
export const getSaltRounds = (): number => Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

/** Password SELALU lewat fungsi ini sebelum masuk database. Password asli tidak pernah disimpan. */
export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, getSaltRounds());

export const authService = {
  async register(input: RegisterInput) {
    if (await userRepository.findByEmail(input.email)) throw conflict('Email sudah terdaftar');

    const id = await userRepository.create({
      name: input.name,
      email: input.email,
      password_hash: await hashPassword(input.password),
      // Role ditentukan SERVER, bukan client: pendaftaran mandiri = customer.
      role: 'customer',
    });
    // findById tidak menyertakan password_hash -> aman dikirim ke client.
    return (await userRepository.findById(id))!;
  },

  async login(input: LoginInput) {
    const row = await userRepository.findAuthByEmail(input.email);

    // Pesan sengaja SAMA untuk "email tidak terdaftar" dan "password salah",
    // supaya penyerang tidak bisa menebak email mana yang terdaftar.
    if (!row) throw unauthorized('Email atau password salah');
    if (!(await bcrypt.compare(input.password, row.password_hash))) {
      throw unauthorized('Email atau password salah');
    }

    const user: AuthUser = { id: row.id, name: row.name, email: row.email, role: row.role };
    return { token: signToken(user), token_type: 'Bearer' as const, expires_in: getJwtExpiresIn(), user };
  },
};
