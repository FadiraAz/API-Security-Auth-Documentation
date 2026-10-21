import { z } from 'zod';
import { optionalId, optionalText, paginationDto, requiredError, strictBody } from './common.dto.ts';

/**
 * Body POST /stalls. SENGAJA tanpa `owner_id`: pemilik kantin selalu user dari token.
 * Kalau owner_id diterima dari body, satu akun owner bisa membuat kantin atas nama owner lain.
 */
export const createStallDto = strictBody({
  name: z
    .string({ error: requiredError('name') })
    .trim()
    .min(3, 'name minimal 3 karakter')
    .max(100, 'name maksimal 100 karakter'),
  category: optionalText('category', 50),
  location: optionalText('location', 100),
  description: optionalText('description', 1000),
});

/** PUT /stalls/:id = versi parsial dari POST (semua field opsional, tapi minimal satu harus dikirim). */
export const updateStallDto = createStallDto
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Minimal satu field harus diisi' });

/** Query GET /stalls: search, category, page, limit (+ filter tambahan dari Tugas 2). */
export const listStallQueryDto = paginationDto.extend({
  search: z.string({ error: 'search harus berupa teks' }).trim().max(100, 'search maksimal 100 karakter').optional(),
  category: z.string({ error: 'category harus berupa teks' }).trim().max(50, 'category maksimal 50 karakter').optional(),
  // --- filter tambahan (sudah ada sejak Tugas 2) ---
  location: z.string({ error: 'location harus berupa teks' }).trim().max(100, 'location maksimal 100 karakter').optional(),
  owner_id: optionalId('owner_id'),
  min_rating: z.coerce
    .number({ error: 'min_rating harus berupa angka' })
    .min(0, 'min_rating minimal 0')
    .max(5, 'min_rating maksimal 5')
    .optional(),
  sort_by: z
    .enum(['name', 'avg_rating', 'review_count', 'created_at'], {
      error: 'sort_by harus salah satu dari: name, avg_rating, review_count, created_at',
    })
    .default('created_at'),
  order: z.enum(['asc', 'desc'], { error: 'order harus asc atau desc' }).default('desc'),
});

export type CreateStallInput = z.infer<typeof createStallDto>;
export type UpdateStallInput = z.infer<typeof updateStallDto>;
export type ListStallQuery = z.infer<typeof listStallQueryDto>;
