import { sql } from 'drizzle-orm';
import { bit, datetime2, decimal, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';

export const userRoles = ['admin', 'owner', 'customer'] as const;
export const flagStatuses = ['pending', 'resolved', 'dismissed'] as const;

export const users = mssqlTable('USERS', {
  id: int().identity().primaryKey(),
  name: nvarchar({ length: 100 }).notNull(),
  email: nvarchar({ length: 150 }).notNull().unique(),
  password_hash: nvarchar({ length: 255 }).notNull(),
  role: nvarchar({ length: 20, enum: userRoles }).notNull(),
  created_at: datetime2().notNull().default(sql`SYSDATETIME()`),
});

export const stalls = mssqlTable('STALLS', {
  id: int().identity().primaryKey(),
  owner_id: int().notNull(),
  name: nvarchar({ length: 100 }).notNull(),
  category: nvarchar({ length: 50 }),
  location: nvarchar({ length: 100 }),
  description: nvarchar({ length: 'max' }),
  avg_rating: decimal({ precision: 3, scale: 2, mode: 'number' }).notNull().default(0),
  review_count: int().notNull().default(0),
  created_at: datetime2().notNull().default(sql`SYSDATETIME()`),
});

export const menuItems = mssqlTable('MENU_ITEMS', {
  id: int().identity().primaryKey(),
  stall_id: int().notNull(),
  name: nvarchar({ length: 100 }).notNull(),
  price: int().notNull(),
  is_available: bit().notNull().default(true),
});

export const reviews = mssqlTable('REVIEWS', {
  id: int().identity().primaryKey(),
  stall_id: int().notNull(),
  user_id: int().notNull(),
  rating: int().notNull(),
  comment: nvarchar({ length: 'max' }),
  like_count: int().notNull().default(0),
  created_at: datetime2().notNull().default(sql`SYSDATETIME()`),
  updated_at: datetime2(),
});

export const likes = mssqlTable('LIKES', {
  id: int().identity().primaryKey(),
  review_id: int().notNull(),
  user_id: int().notNull(),
  created_at: datetime2().notNull().default(sql`SYSDATETIME()`),
});

export const flags = mssqlTable('FLAGS', {
  id: int().identity().primaryKey(),
  review_id: int().notNull(),
  reported_by: int().notNull(),
  reason: nvarchar({ length: 255 }),
  status: nvarchar({ length: 20, enum: flagStatuses }).notNull().default('pending'),
  created_at: datetime2().notNull().default(sql`SYSDATETIME()`),
});

export const auditLogs = mssqlTable('AUDIT_LOGS', {
  id: int().identity().primaryKey(),
  user_id: int().notNull(),
  action: nvarchar({ length: 50 }).notNull(),
  target_table: nvarchar({ length: 50 }).notNull(),
  target_id: int().notNull(),
  metadata: nvarchar({ length: 'max' }),
  timestamp: datetime2('created_at').notNull().default(sql`SYSDATETIME()`),
});
