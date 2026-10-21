import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';
import { ValidationError, type ValidationIssue } from '../utils/AppError.ts';

export type RequestSource = 'body' | 'query' | 'params';

/**
 * Middleware validasi berbasis schema zod.
 *
 * Hasil parse yang sukses disimpan di `res.locals.validated[source]` dan dibaca
 * controller lewat `getValidated()`. Kita TIDAK menimpa `req.query` karena di
 * Express 5 properti itu read-only (getter).
 *
 * Gagal -> ValidationError (400) -> errorHandler -> format error yang seragam.
 */
export function validate(schema: ZodType, source: RequestSource): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const issues: ValidationIssue[] = result.error.issues.map((issue) => ({
        // issue.path kosong = masalah di level objek (mis. kunci tak dikenal) -> pakai nama sumbernya.
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(new ValidationError(issues));
    }

    const validated = (res.locals.validated ?? {}) as Record<string, unknown>;
    validated[source] = result.data;
    res.locals.validated = validated;
    return next();
  };
}

/** Ambil data hasil validasi dari satu sumber request di dalam controller. */
export function getValidated<T>(res: Response, source: RequestSource): T {
  const validated = (res.locals.validated ?? {}) as Record<string, unknown>;
  return validated[source] as T;
}
