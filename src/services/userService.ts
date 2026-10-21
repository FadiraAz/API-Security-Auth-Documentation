import type { CreateUserInput, ListUserQuery } from '../dtos/user.dto.ts';
import { userRepository } from '../repositories/userRepository.ts';
import { conflict } from '../utils/AppError.ts';
import { hashPassword } from './authService.ts';

export const userService = {
  list(query: ListUserQuery) {
    return userRepository.findAll(query.role);
  },

  async create(input: CreateUserInput) {
    if (await userRepository.findByEmail(input.email)) throw conflict('Email sudah terdaftar');

    const id = await userRepository.create({
      name: input.name,
      email: input.email,
      role: input.role,
      password_hash: await hashPassword(input.password),
    });
    return (await userRepository.findById(id))!;
  },
};
