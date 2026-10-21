import { z } from 'zod';
import { optionalId, paginationDto, requiredError, strictBody } from './common.dto.ts';

/** Body POST /audit-logs. SENGAJA tanpa `user_id`: pelaku dicatat dari token. */
export const createAuditLogDto = strictBody({
  action: z.string({ error: requiredError('action') }).trim().min(1, 'action wajib diisi').max(50, 'action maksimal 50 karakter'),
  target_table: z
    .string({ error: requiredError('target_table') })
    .trim()
    .min(1, 'target_table wajib diisi')
    .max(50, 'target_table maksimal 50 karakter'),
  target_id: z
    .number({ error: requiredError('target_id', 'angka') })
    .int('target_id harus bilangan bulat')
    .positive('target_id harus lebih dari 0'),
  // boleh object (disimpan sebagai JSON string) atau string biasa
  metadata: z.union([z.string(), z.record(z.string(), z.unknown())], { error: 'metadata harus berupa teks atau objek' }).optional(),
});

export const listAuditLogQueryDto = paginationDto.extend({
  user_id: optionalId('user_id'),
  action: z.string({ error: 'action harus berupa teks' }).trim().max(50, 'action maksimal 50 karakter').optional(),
  target_table: z.string({ error: 'target_table harus berupa teks' }).trim().max(50, 'target_table maksimal 50 karakter').optional(),
});

export type CreateAuditLogInput = z.infer<typeof createAuditLogDto>;
export type ListAuditLogQuery = z.infer<typeof listAuditLogQueryDto>;
