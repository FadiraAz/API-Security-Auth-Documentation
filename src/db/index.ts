import 'dotenv/config';
import mssql from 'mssql'; // paket CommonJS: pakai default import (named import gagal di Node ESM)
import { drizzle } from 'drizzle-orm/node-mssql';

async function createDb() {
  const pool = await mssql.connect({
    server: process.env.DB_SERVER ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 1433),
    database: process.env.DB_NAME ?? 'review_kantin',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate:
        (process.env.DB_TRUST_SERVER_CERTIFICATE ?? process.env.DB_TRUST_SERVER_CERT) !== 'false',
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  });
  return drizzle({ client: pool });
}

export type Db = Awaited<ReturnType<typeof createDb>>;

// Satu pool koneksi dipakai bersama (singleton). Kalau gagal konek, boleh dicoba lagi.
let dbPromise: Promise<Db> | undefined;

export function getDb(): Promise<Db> {
  dbPromise ??= createDb().catch((err) => {
    dbPromise = undefined;
    throw err;
  });
  return dbPromise;
}
