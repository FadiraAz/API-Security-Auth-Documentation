import { z } from 'zod';

/**
 * Pesan error untuk field: tidak dikirim -> "<field> wajib diisi",
 * tipe datanya salah -> "<field> harus berupa <tipe>".
 */
export const requiredError =
  (field: string, type = 'teks') =>
  (issue: { input?: unknown }) =>
    issue.input === undefined ? `${field} wajib diisi` : `${field} harus berupa ${type}`;

/** String opsional (boleh tidak dikirim / null): di-trim dan dibatasi panjang maksimalnya. */
export const optionalText = (field: string, max: number) =>
  z
    .string({ error: `${field} harus berupa teks` })
    .trim()
    .max(max, `${field} maksimal ${max} karakter`)
    .nullable()
    .optional();

/**
 * Object body yang STRICT: kunci di luar daftar ditolak dengan 400.
 * Inilah yang mencegah client menyelundupkan `role`, `owner_id`, atau `user_id`
 * lewat body — identitas selalu diambil dari token, bukan dari body.
 */
export const strictBody = <T extends z.ZodRawShape>(shape: T) =>
  z.strictObject(shape, {
    error: (issue) => {
      if (issue.code === 'unrecognized_keys') {
        return `body hanya boleh berisi ${Object.keys(shape).join(', ')}`;
      }
      if (issue.code === 'invalid_type') return 'body harus berupa objek JSON';
      return undefined; // selain itu pakai pesan default
    },
  });

/** Parameter path `:id` -> angka bulat > 0. Dipakai di semua route yang punya `/:id`. */
export const idParamDto = z.object({
  id: z.coerce
    .number({ error: 'id harus berupa angka' })
    .int('id harus bilangan bulat')
    .positive('id harus lebih dari 0'),
});

/** Filter id opsional di query string, mis. `?stall_id=3`. */
export const optionalId = (field: string) =>
  z.coerce
    .number({ error: `${field} harus berupa angka` })
    .int(`${field} harus bilangan bulat`)
    .positive(`${field} harus lebih dari 0`)
    .optional();

/** Pagination query: page (min 1, default 1) dan limit (1..100, default 10). */
export const paginationDto = z.object({
  page: z.coerce
    .number({ error: 'page harus berupa angka' })
    .int('page harus bilangan bulat')
    .min(1, 'page minimal 1')
    .default(1),
  limit: z.coerce
    .number({ error: 'limit harus berupa angka' })
    .int('limit harus bilangan bulat')
    .min(1, 'limit minimal 1')
    .max(100, 'limit maksimal 100')
    .default(10),
});

export type IdParam = z.infer<typeof idParamDto>;
