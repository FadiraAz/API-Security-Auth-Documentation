import { z } from 'zod';
import { loginDto, registerDto } from '../dtos/auth.dto.ts';
import { createUserDto } from '../dtos/user.dto.ts';
import { createStallDto, updateStallDto } from '../dtos/stall.dto.ts';
import { createMenuItemDto, updateMenuItemDto } from '../dtos/menuItem.dto.ts';
import { createReviewDto } from '../dtos/review.dto.ts';
import { createLikeDto } from '../dtos/like.dto.ts';
import { updateFlagStatusDto } from '../dtos/flag.dto.ts';
import { createAuditLogDto } from '../dtos/auditLog.dto.ts';

/* ------------------------------------------------------------------ helpers */
type Obj = Record<string, any>;

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: Obj) => ({ 'application/json': { schema } });
const nullable = (type: string, extra: Obj = {}) => ({ type: [type, 'null'], ...extra });

/** Skema request body diambil langsung dari DTO Zod -> dokumentasi selalu sinkron dengan validasi. */
function bodyOf(dto: z.ZodType, example: unknown) {
  const { $schema, ...schema } = z.toJSONSchema(dto, { io: 'input', unrepresentable: 'any' }) as Obj;
  return { required: true, content: json({ ...schema, example }) };
}

const errorResponse = (description: string) => ({ description, content: json(ref('Error')) });
const ERR: Record<number, Obj> = {
  400: errorResponse('Validasi gagal / parameter tidak valid'),
  401: errorResponse('Belum terautentikasi: token tidak ada, salah format, signature tidak cocok, atau kedaluwarsa'),
  403: errorResponse('Sudah login (token valid) tetapi role / kepemilikan resource tidak mencukupi'),
  404: errorResponse('Data tidak ditemukan'),
  409: errorResponse('Konflik data (duplikat / melanggar relasi)'),
  500: { description: 'Kesalahan server', content: json(ref('ServerError')) },
};

const okResponse = (description: string, data: Obj | null, paged = false) => ({
  description,
  content: json({
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      message: { type: 'string' },
      data: data ?? { type: 'null' },
      ...(paged ? { meta: ref('PageMeta') } : {}),
    },
  }),
});

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer', exclusiveMinimum: 0 },
  example: 1,
};

const query = (name: string, schema: Obj, description: string, example?: unknown) => ({
  name,
  in: 'query',
  required: false,
  description,
  schema,
  ...(example !== undefined ? { example } : {}),
});

const pageParams = [
  query('page', { type: 'integer', minimum: 1, default: 1 }, 'Nomor halaman'),
  query('limit', { type: 'integer', minimum: 1, maximum: 100, default: 10 }, 'Jumlah data per halaman'),
];

/**
 * Siapa yang boleh memanggil endpoint:
 *  - 'public'            : tanpa token
 *  - 'login'             : token valid, semua role
 *  - { roles, ownership }: token valid + role tertentu (+ catatan kepemilikan kalau ada -> 403)
 */
type Access = 'public' | 'login' | { roles: string[]; ownership?: string };

const accessNote = (a: Access): string =>
  a === 'public'
    ? 'Akses: **publik** (tanpa token).'
    : a === 'login'
      ? 'Akses: **login** (semua role). Wajib header `Authorization: Bearer <token>`.'
      : `Akses: role **${a.roles.join(', ')}**.${a.ownership ? ` ${a.ownership}` : ''} Wajib header \`Authorization: Bearer <token>\`.`;

interface OpConfig {
  summary: string;
  description?: string;
  access: Access;
  params?: Obj[];
  body?: Obj;
  success: { code: 200 | 201; description: string; data: Obj | null; paged?: boolean };
  /** kode error spesifik endpoint; 401/403 ditambahkan otomatis dari `access`. Boleh [kode, deskripsi]. */
  errors: Array<number | [number, string]>;
}

function op(tag: string, c: OpConfig) {
  const secured = c.access !== 'public';
  const hasForbidden = typeof c.access === 'object';
  const responses: Obj = { [c.success.code]: okResponse(c.success.description, c.success.data, c.success.paged) };

  for (const e of c.errors) {
    if (Array.isArray(e)) responses[e[0]] = errorResponse(e[1]);
    else responses[e] = ERR[e];
  }
  if (secured && !responses[401]) responses[401] = ERR[401];
  if (hasForbidden) responses[403] = ERR[403];

  return {
    tags: [tag],
    summary: c.summary,
    description: [c.description, accessNote(c.access)].filter(Boolean).join('\n\n'),
    ...(secured ? { security: [{ bearerAuth: [] }] } : {}),
    ...(c.params ? { parameters: c.params } : {}),
    ...(c.body ? { requestBody: c.body } : {}),
    responses,
  };
}

/* ------------------------------------------------------------------ schemas */
const schemas: Obj = {
  Error: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'fail' },
      message: { type: 'string', example: 'Validasi gagal' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string', example: 'name' },
            message: { type: 'string', example: 'name minimal 3 karakter' },
          },
        },
      },
    },
  },
  ServerError: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      message: { type: 'string', example: 'Kesalahan server' },
    },
  },
  PageMeta: {
    type: 'object',
    properties: {
      page: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 10 },
      total: { type: 'integer', example: 10 },
      total_pages: { type: 'integer', example: 1 },
    },
  },
  User: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 12 },
      name: { type: 'string', example: 'Bagas Pratama' },
      email: { type: 'string', example: 'bagas@student.test' },
      role: { type: 'string', enum: ['admin', 'owner', 'customer'] },
      created_at: { type: 'string', format: 'date-time' },
    },
  },
  Stall: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      owner_id: { type: 'integer', example: 2 },
      name: { type: 'string', example: 'Warung Bu Tini' },
      category: nullable('string', { example: 'Kwetiau' }),
      location: nullable('string', { example: 'Kantin FKIP' }),
      description: nullable('string', { example: 'Kedai kwetiau goreng & kuah' }),
      avg_rating: { type: 'number', example: 4.5 },
      review_count: { type: 'integer', example: 2 },
      created_at: { type: 'string', format: 'date-time' },
    },
  },
  MenuItemWithStall: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Kwetiau Goreng Spesial' },
      price: { type: 'integer', example: 15000 },
      is_available: { type: 'boolean', example: true },
      stall: {
        type: 'object',
        description: 'Hasil JOIN dengan tabel STALLS',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Warung Bu Tini' },
          category: nullable('string', { example: 'Kwetiau' }),
          location: nullable('string', { example: 'Kantin FKIP' }),
        },
      },
    },
  },
  ReviewWithUser: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      stall_id: { type: 'integer', example: 1 },
      rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
      comment: nullable('string', { example: 'Enak!' }),
      like_count: { type: 'integer', example: 3 },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: nullable('string', { format: 'date-time' }),
      user: {
        type: 'object',
        description: 'Hasil JOIN dengan tabel USERS',
        properties: {
          id: { type: 'integer', example: 12 },
          name: { type: 'string', example: 'Bagas Pratama' },
        },
      },
    },
  },
  Like: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      review_id: { type: 'integer', example: 1 },
      user_id: { type: 'integer', example: 13 },
      created_at: { type: 'string', format: 'date-time' },
    },
  },
  FlagDetail: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      reason: nullable('string', { example: 'Diduga review palsu' }),
      status: { type: 'string', enum: ['pending', 'resolved', 'dismissed'] },
      created_at: { type: 'string', format: 'date-time' },
      review: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 3 },
          rating: { type: 'integer', example: 4 },
          comment: nullable('string', { example: 'Lumayan' }),
        },
      },
      reporter: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 13 },
          name: { type: 'string', example: 'Sinta Maharani' },
        },
      },
    },
  },
  AuditLog: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      user_id: { type: 'integer', example: 1 },
      action: { type: 'string', example: 'RESOLVE_FLAG' },
      target_table: { type: 'string', example: 'FLAGS' },
      target_id: { type: 'integer', example: 3 },
      metadata: nullable('string', { example: '{"new_status":"resolved"}' }),
      timestamp: { type: 'string', format: 'date-time' },
    },
  },
  AuthUser: {
    type: 'object',
    description: 'Identitas yang dibawa token JWT',
    properties: {
      id: { type: 'integer', example: 12 },
      name: { type: 'string', example: 'Bagas Pratama' },
      email: { type: 'string', example: 'bagas@student.test' },
      role: { type: 'string', enum: ['admin', 'owner', 'customer'] },
    },
  },
  LoginResult: {
    type: 'object',
    properties: {
      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      token_type: { type: 'string', example: 'Bearer' },
      expires_in: { type: 'string', example: '2h' },
      user: ref('AuthUser'),
    },
  },
  RegisterResult: {
    type: 'object',
    properties: { user: ref('User') },
  },
};

const arrayOf = (name: string) => ({ type: 'array', items: ref(name) });

const ADMIN: Access = { roles: ['admin'] };
const OWNER_ADMIN_STALL: Access = {
  roles: ['owner', 'admin'],
  ownership: 'Owner hanya boleh pada kantin **miliknya** (selain itu 403); admin boleh semua.',
};

/* -------------------------------------------------------------------- paths */
const paths: Obj = {
  '/auth/register': {
    post: op('AUTH', {
      summary: 'Daftar akun baru',
      description:
        'Role selalu diisi server sebagai `customer`. Field `role` tidak ada di schema sehingga body yang memuatnya ditolak (400). Password di-hash (bcrypt) sebelum disimpan.',
      access: 'public',
      body: bodyOf(registerDto, { name: 'Budi Santoso', email: 'budi@student.test', password: 'rahasia123' }),
      success: { code: 201, description: 'Akun dibuat', data: ref('RegisterResult') },
      errors: [400, 409, 500],
    }),
  },
  '/auth/login': {
    post: op('AUTH', {
      summary: 'Login dan terima token JWT',
      description:
        'Token dikirim di header `Authorization: Bearer <token>` pada endpoint yang membutuhkan login. Di Swagger UI: tekan tombol **Authorize** lalu tempel token.',
      access: 'public',
      body: bodyOf(loginDto, { email: 'admin@kantin.test', password: 'rahasia123' }),
      success: { code: 200, description: 'Login berhasil, token dikembalikan', data: ref('LoginResult') },
      errors: [400, [401, 'Email atau password salah'], 500],
    }),
  },
  '/auth/me': {
    get: op('AUTH', {
      summary: 'Data user dari token',
      description: 'Membalas identitas yang ada di token (id, name, email, role) tanpa query database.',
      access: 'login',
      success: { code: 200, description: 'Identitas user', data: ref('AuthUser') },
      errors: [500],
    }),
  },

  '/users': {
    get: op('USERS', {
      summary: 'Daftar user',
      description: '`password_hash` tidak pernah dikembalikan.',
      access: ADMIN,
      params: [query('role', { type: 'string', enum: ['admin', 'owner', 'customer'] }, 'Filter berdasarkan role')],
      success: { code: 200, description: 'Daftar user', data: arrayOf('User') },
      errors: [400, 500],
    }),
    post: op('USERS', {
      summary: 'Tambah user dengan role tertentu',
      description: 'Dipakai admin untuk membuat akun owner/admin. Password di-hash (bcrypt) sebelum disimpan.',
      access: ADMIN,
      body: bodyOf(createUserDto, {
        name: 'Pak Budi',
        email: 'budi@kantin.test',
        password: 'rahasia123',
        role: 'owner',
      }),
      success: { code: 201, description: 'User dibuat', data: ref('User') },
      errors: [400, 409, 500],
    }),
  },

  '/stalls': {
    get: op('STALLS', {
      summary: 'Daftar kantin (search + filter + sorting + pagination)',
      access: 'public',
      params: [
        ...pageParams,
        query('search', { type: 'string', maxLength: 100 }, 'Cari di nama / deskripsi kantin', 'bakso'),
        query('category', { type: 'string', maxLength: 50 }, 'Filter kategori (sama persis)', 'Minuman'),
        query('location', { type: 'string', maxLength: 100 }, 'Filter lokasi (mengandung teks)', 'FEB'),
        query('owner_id', { type: 'integer' }, 'Filter berdasarkan pemilik'),
        query('min_rating', { type: 'number', minimum: 0, maximum: 5 }, 'Rating rata-rata minimal', 4.5),
        query(
          'sort_by',
          { type: 'string', enum: ['name', 'avg_rating', 'review_count', 'created_at'], default: 'created_at' },
          'Urutkan berdasarkan kolom',
        ),
        query('order', { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, 'Arah pengurutan'),
      ],
      success: { code: 200, description: 'Daftar kantin + meta pagination', data: arrayOf('Stall'), paged: true },
      errors: [400, 500],
    }),
    post: op('STALLS', {
      summary: 'Tambah kantin',
      description: '`owner_id` TIDAK ada di body: pemilik kantin selalu user dari token.',
      access: { roles: ['owner', 'admin'] },
      body: bodyOf(createStallDto, {
        name: 'Kantin Baru',
        category: 'Minuman',
        location: 'Kantin FKIP',
        description: 'Es teh dan kopi',
      }),
      success: { code: 201, description: 'Kantin dibuat', data: ref('Stall') },
      errors: [400, 500],
    }),
  },
  '/stalls/{id}': {
    get: op('STALLS', {
      summary: 'Detail kantin',
      access: 'public',
      params: [idParam],
      success: { code: 200, description: 'Detail kantin', data: ref('Stall') },
      errors: [400, 404, 500],
    }),
    put: op('STALLS', {
      summary: 'Ubah kantin',
      description:
        'Boleh mengirim sebagian field (minimal satu). `avg_rating` & `review_count` dihitung otomatis dari review.',
      access: OWNER_ADMIN_STALL,
      params: [idParam],
      body: bodyOf(updateStallDto, { name: 'Warung Bu Tini (Renovasi)', location: 'Kantin FK' }),
      success: { code: 200, description: 'Kantin diperbarui', data: ref('Stall') },
      errors: [400, 404, 500],
    }),
    delete: op('STALLS', {
      summary: 'Hapus kantin',
      description: 'Menu, review, like, dan flag milik kantin ikut terhapus (ON DELETE CASCADE).',
      access: ADMIN,
      params: [idParam],
      success: { code: 200, description: 'Kantin dihapus', data: null },
      errors: [400, 404, 500],
    }),
  },
  '/stalls/{id}/reviews': {
    post: op('STALLS', {
      summary: 'Beri review untuk sebuah kantin',
      description:
        'Penulis review diambil dari token, bukan dari body (`user_id` tidak ada di schema). Satu user hanya boleh mereview satu kantin satu kali; `avg_rating` & `review_count` kantin ikut diperbarui.',
      access: 'login',
      params: [idParam],
      body: bodyOf(createReviewDto, { rating: 5, comment: 'Enak dan murah!' }),
      success: { code: 201, description: 'Review dibuat', data: ref('ReviewWithUser') },
      errors: [400, 404, 409, 500],
    }),
  },

  '/menu-items': {
    get: op('MENU_ITEMS', {
      summary: 'Daftar menu + data kantin (JOIN STALLS)',
      access: 'public',
      params: [
        ...pageParams,
        query('stall_id', { type: 'integer' }, 'Filter menu milik kantin tertentu', 1),
        query('is_available', { type: 'string', enum: ['true', 'false'] }, 'Filter ketersediaan'),
        query('q', { type: 'string' }, 'Cari nama menu', 'nasi'),
      ],
      success: { code: 200, description: 'Daftar menu + meta pagination', data: arrayOf('MenuItemWithStall'), paged: true },
      errors: [400, 500],
    }),
    post: op('MENU_ITEMS', {
      summary: 'Tambah menu',
      access: OWNER_ADMIN_STALL,
      body: bodyOf(createMenuItemDto, {
        stall_id: 1,
        name: 'Kwetiau Siram',
        price: 16000,
        is_available: true,
      }),
      success: { code: 201, description: 'Menu dibuat (beserta data kantin)', data: ref('MenuItemWithStall') },
      errors: [400, 404, 500],
    }),
  },
  '/menu-items/{id}': {
    get: op('MENU_ITEMS', {
      summary: 'Detail menu + data kantin (JOIN STALLS)',
      access: 'public',
      params: [idParam],
      success: { code: 200, description: 'Detail menu', data: ref('MenuItemWithStall') },
      errors: [400, 404, 500],
    }),
    put: op('MENU_ITEMS', {
      summary: 'Ubah menu',
      description: 'Boleh mengirim sebagian field (minimal satu).',
      access: OWNER_ADMIN_STALL,
      params: [idParam],
      body: bodyOf(updateMenuItemDto, { price: 17000, is_available: false }),
      success: { code: 200, description: 'Menu diperbarui', data: ref('MenuItemWithStall') },
      errors: [400, 404, 500],
    }),
    delete: op('MENU_ITEMS', {
      summary: 'Hapus menu',
      access: OWNER_ADMIN_STALL,
      params: [idParam],
      success: { code: 200, description: 'Menu dihapus', data: null },
      errors: [400, 404, 500],
    }),
  },

  '/reviews': {
    get: op('REVIEWS', {
      summary: 'Daftar review + data pengulas (JOIN USERS)',
      description: 'Untuk membuat review gunakan `POST /stalls/{id}/reviews`.',
      access: 'public',
      params: [
        ...pageParams,
        query('stall_id', { type: 'integer' }, 'Filter review untuk kantin tertentu', 1),
        query('user_id', { type: 'integer' }, 'Filter review milik user tertentu'),
        query('min_rating', { type: 'integer', minimum: 1, maximum: 5 }, 'Rating minimal'),
      ],
      success: { code: 200, description: 'Daftar review + meta pagination', data: arrayOf('ReviewWithUser'), paged: true },
      errors: [400, 500],
    }),
  },
  '/reviews/{id}': {
    get: op('REVIEWS', {
      summary: 'Detail review + data pengulas (JOIN USERS)',
      access: 'public',
      params: [idParam],
      success: { code: 200, description: 'Detail review', data: ref('ReviewWithUser') },
      errors: [400, 404, 500],
    }),
    delete: op('REVIEWS', {
      summary: 'Hapus review',
      description:
        'Penulis review boleh menghapus review-nya sendiri, admin boleh menghapus review siapa pun; selain itu 403. Rating kantin dihitung ulang. Like dan flag pada review ikut terhapus.',
      access: 'login',
      params: [idParam],
      success: { code: 200, description: 'Review dihapus', data: null },
      errors: [400, [403, 'Sudah login tetapi bukan penulis review ini (dan bukan admin)'], 404, 500],
    }),
  },

  '/likes': {
    post: op('LIKES', {
      summary: 'Like sebuah review',
      description:
        '`user_id` diambil dari token, bukan dari body. Satu user hanya bisa like satu review satu kali; `like_count` review ikut diperbarui.',
      access: 'login',
      body: bodyOf(createLikeDto, { review_id: 3 }),
      success: { code: 201, description: 'Like ditambahkan', data: ref('Like') },
      errors: [400, 404, 409, 500],
    }),
  },
  '/likes/{id}': {
    delete: op('LIKES', {
      summary: 'Batalkan like',
      description: 'Hanya pemilik like (atau admin) yang boleh membatalkan; selain itu 403.',
      access: 'login',
      params: [idParam],
      success: { code: 200, description: 'Like dihapus', data: null },
      errors: [400, [403, 'Sudah login tetapi bukan pemilik like ini (dan bukan admin)'], 404, 500],
    }),
  },

  '/flags': {
    get: op('FLAGS', {
      summary: 'Daftar laporan review (flag)',
      access: ADMIN,
      params: [
        query('status', { type: 'string', enum: ['pending', 'resolved', 'dismissed'] }, 'Filter status', 'pending'),
        query('review_id', { type: 'integer' }, 'Filter berdasarkan review'),
      ],
      success: { code: 200, description: 'Daftar flag', data: arrayOf('FlagDetail') },
      errors: [400, 500],
    }),
  },
  '/flags/{id}': {
    put: op('FLAGS', {
      summary: 'Ubah status flag',
      access: ADMIN,
      params: [idParam],
      body: bodyOf(updateFlagStatusDto, { status: 'resolved' }),
      success: { code: 200, description: 'Status flag diperbarui', data: ref('FlagDetail') },
      errors: [400, 404, 500],
    }),
  },

  '/audit-logs': {
    get: op('AUDIT_LOGS', {
      summary: 'Daftar audit log (pagination)',
      access: ADMIN,
      params: [
        ...pageParams,
        query('user_id', { type: 'integer' }, 'Filter berdasarkan pelaku'),
        query('action', { type: 'string' }, 'Filter aksi', 'RESOLVE_FLAG'),
        query('target_table', { type: 'string' }, 'Filter tabel target', 'FLAGS'),
      ],
      success: { code: 200, description: 'Daftar audit log + meta pagination', data: arrayOf('AuditLog'), paged: true },
      errors: [400, 500],
    }),
    post: op('AUDIT_LOGS', {
      summary: 'Catat audit log',
      description:
        'Pelaku (`user_id`) dicatat dari token. `metadata` boleh berupa object (disimpan sebagai JSON string) atau string biasa.',
      access: ADMIN,
      body: bodyOf(createAuditLogDto, {
        action: 'RESOLVE_FLAG',
        target_table: 'FLAGS',
        target_id: 1,
        metadata: { note: 'review dihapus' },
      }),
      success: { code: 201, description: 'Audit log dicatat', data: ref('AuditLog') },
      errors: [400, 500],
    }),
  },
};

/* --------------------------------------------------------------------- spec */
export const openapiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Review Kantin API',
    version: '2.0.0',
    description:
      'REST API sistem review kantin (Express.js + Drizzle ORM + SQL Server).\n\n' +
      '**Autentikasi JWT.** Login lewat `POST /auth/login`, lalu tekan tombol **Authorize** (kanan atas) ' +
      'dan tempel token. Endpoint bertanda gembok membutuhkan token.\n\n' +
      '**401 vs 403.** 401 = belum/tidak terautentikasi (token tidak ada/tidak valid). ' +
      '403 = sudah login tetapi tidak punya akses (role atau kepemilikan tidak cocok).\n\n' +
      '**Format error:** `{ \"status\": \"fail\", \"message\": \"...\", \"errors\": [{ \"field\": \"...\", \"message\": \"...\" }] }`.',
  },
  servers: [{ url: '/api/v1', description: 'API v1' }],
  tags: [
    { name: 'AUTH', description: 'Register, login (publik), me (login)' },
    { name: 'USERS', description: 'Manajemen user (admin)' },
    { name: 'STALLS', description: 'Publik: baca. owner/admin: tambah & ubah (owner hanya miliknya). admin: hapus. login: review' },
    { name: 'MENU_ITEMS', description: 'Publik: baca. owner (kantin miliknya)/admin: tambah, ubah, hapus' },
    { name: 'REVIEWS', description: 'Publik: baca. Penulis/admin: hapus' },
    { name: 'LIKES', description: 'login: like. Pemilik/admin: batalkan' },
    { name: 'FLAGS', description: 'Admin: lihat & ubah status' },
    { name: 'AUDIT_LOGS', description: 'Admin: lihat & catat' },
  ],
  paths,
  components: {
    schemas,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT dari `POST /auth/login`.',
      },
    },
  },
};
