import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.ts';

/** Ambil nomor error SQL Server (bisa terbungkus di .cause / .originalError). */
function sqlErrorNumber(err: unknown): number | undefined {
  let cur: any = err;
  for (let i = 0; i < 5 && cur; i++) {
    if (typeof cur.number === 'number') return cur.number;
    cur = cur.cause ?? cur.originalError;
  }
  return undefined;
}

/**
 * SATU-SATUNYA tempat error diubah menjadi respons JSON.
 *
 * Format (sesuai ketentuan Tugas 3):
 *   { "status": "fail",  "message": "...", "errors": [{ "field": "...", "message": "..." }] }   -> error client (4xx)
 *   { "status": "error", "message": "..." }                                                      -> error server (5xx)
 *
 * `errors` hanya muncul kalau ada detail (validasi gagal).
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // 1) Error aplikasi yang disengaja: ValidationError(400), unauthorized(401), forbidden(403), notFound(404), dst.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // 2) Jaring pengaman: ZodError yang lolos tanpa lewat middleware validate.
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validasi gagal',
      errors: err.issues.map((i) => ({ field: i.path.join('.') || 'body', message: i.message })),
    });
  }

  // 3) Body JSON rusak (express.json melempar error bertipe entity.parse.failed).
  if ((err as any)?.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'fail', message: 'Body JSON tidak valid' });
  }

  // 4) Konflik constraint database SQL Server: 2627/2601 = duplikat, 547 = foreign key.
  const num = sqlErrorNumber(err);
  if (num === 2627 || num === 2601) {
    return res.status(409).json({ status: 'fail', message: 'Data duplikat (unique constraint)' });
  }
  if (num === 547) {
    return res.status(409).json({
      status: 'fail',
      message: 'Melanggar relasi/constraint database (data induk tidak ada atau masih dipakai)',
    });
  }

  // 5) Error tak terduga: detail hanya ke log server, tidak dibocorkan ke client.
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server' });
}
