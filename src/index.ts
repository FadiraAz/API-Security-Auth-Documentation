import 'dotenv/config';
import express, { type Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { sql } from 'drizzle-orm';
import { getDb } from './db/index.ts';
import { authRouter } from './routes/authRouter.ts';
import { userRouter } from './routes/userRouter.ts';
import { stallRouter } from './routes/stallRouter.ts';
import { menuItemRouter } from './routes/menuItemRouter.ts';
import { reviewRouter } from './routes/reviewRouter.ts';
import { likeRouter } from './routes/likeRouter.ts';
import { flagRouter } from './routes/flagRouter.ts';
import { auditLogRouter } from './routes/auditLogRouter.ts';
import { notFoundHandler } from './middlewares/notFound.ts';
import { errorHandler } from './middlewares/errorHandler.ts';
import { openapiSpec } from './docs/openapi.ts';
import { getJwtSecret } from './services/tokenService.ts';

// Gagal-cepat: server menolak start kalau JWT_SECRET belum diisi di .env.
getJwtSecret();

const app: Application = express();
const PORT: number = Number(process.env.PORT ?? 3000);

app.use(express.json());

// Tanpa try/catch: Express 5 meneruskan handler async yang reject ke errorHandler.
app.get('/health', async (_req, res) => {
  const db = await getDb();
  await db.execute(sql`SELECT 1 AS ok`);
  res.status(200).json({ status: 'success', message: 'Server dan database terhubung' });
});

// Dokumentasi Swagger UI (OpenAPI): http://localhost:3000/docs  (spec mentah: /docs.json)
app.get('/', (_req, res) => res.redirect('/docs'));
app.get('/docs.json', (_req, res) => res.json(openapiSpec));
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'Review Kantin API',
    swaggerOptions: { docExpansion: 'list', tagsSorter: 'alpha', operationsSorter: 'alpha' },
  }),
);

app.use('/api/v1/auth', authRouter); // register & login (publik), me (login)
app.use('/api/v1/users', userRouter);
app.use('/api/v1/stalls', stallRouter);
app.use('/api/v1/menu-items', menuItemRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/flags', flagRouter);
app.use('/api/v1/audit-logs', auditLogRouter);

// 404 untuk rute yang tidak dikenal, lalu error handling terpusat (paling akhir).
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
