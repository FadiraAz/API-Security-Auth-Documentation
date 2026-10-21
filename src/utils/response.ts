import type { Response } from 'express';

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

function send(res: Response, code: number, message: string, data: unknown, meta?: PageMeta) {
  return res.status(code).json({ status: 'success', message, data, ...(meta ? { meta } : {}) });
}

export const ok = (res: Response, message: string, data: unknown = null, meta?: PageMeta) =>
  send(res, 200, message, data, meta);

export const created = (res: Response, message: string, data: unknown) =>
  send(res, 201, message, data);

export const buildMeta = (page: number, limit: number, total: number): PageMeta => ({
  page,
  limit,
  total,
  total_pages: Math.max(1, Math.ceil(total / limit)),
});
