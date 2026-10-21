import { z } from 'zod';
import { optionalId, paginationDto, requiredError, strictBody } from './common.dto.ts';

export const createMenuItemDto = strictBody({
  stall_id: z
    .number({ error: requiredError('stall_id', 'angka') })
    .int('stall_id harus bilangan bulat')
    .positive('stall_id harus lebih dari 0'),
  name: z
    .string({ error: requiredError('name') })
    .trim()
    .min(1, 'name wajib diisi')
    .max(100, 'name maksimal 100 karakter'),
  price: z
    .number({ error: requiredError('price', 'angka') })
    .int('price harus bilangan bulat')
    .min(0, 'price minimal 0'),
  is_available: z.boolean({ error: 'is_available harus berupa boolean' }).default(true),
});

export const updateMenuItemDto = createMenuItemDto
  .omit({ stall_id: true })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Minimal satu field harus diisi' });

export const listMenuItemQueryDto = paginationDto.extend({
  stall_id: optionalId('stall_id'),
  q: z.string({ error: 'q harus berupa teks' }).trim().max(100, 'q maksimal 100 karakter').optional(),
  is_available: z.enum(['true', 'false'], { error: 'is_available harus true atau false' }).optional(),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemDto>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemDto>;
export type ListMenuItemQuery = z.infer<typeof listMenuItemQueryDto>;
