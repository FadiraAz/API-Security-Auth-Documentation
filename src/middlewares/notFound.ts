import type { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    status: 'fail',
    message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}
