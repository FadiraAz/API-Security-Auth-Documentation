/** Error dasar aplikasi: membawa status code HTTP + (opsional) detail untuk field `errors`. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Satu baris pesan validasi: field mana yang salah dan kenapa. */
export interface ValidationIssue {
  field: string;
  message: string;
}

/** Dilempar middleware `validate` kalau input gagal lolos schema zod. HTTP 400. */
export class ValidationError extends AppError {
  constructor(public readonly issues: ValidationIssue[]) {
    super(400, 'Validasi gagal', issues);
    this.name = 'ValidationError';
  }
}

export const notFound = (what: string) => new AppError(404, `${what} tidak ditemukan`);
export const conflict = (msg: string) => new AppError(409, msg);
export const badRequest = (msg: string) => new AppError(400, msg);

/**
 * 401 = "siapa kamu?" -> token tidak ada / salah format / signature tidak cocok / kedaluwarsa.
 * Dipakai juga saat login gagal (email atau password salah).
 */
export const unauthorized = (msg = 'Token tidak ada atau tidak valid') => new AppError(401, msg);

/**
 * 403 = "kamu tahu, tapi tidak boleh" -> token VALID, tetapi role/kepemilikan tidak mencukupi.
 */
export const forbidden = (msg = 'Kamu tidak punya akses ke resource ini') => new AppError(403, msg);
