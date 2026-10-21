import { and, count, desc, eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { auditLogs } from '../db/schema.ts';
import type { ListAuditLogQuery } from '../dtos/auditLog.dto.ts';

export const auditLogRepository = {
  async findAll(q: ListAuditLogQuery) {
    const db = await getDb();
    const where = and(
      q.user_id ? eq(auditLogs.user_id, q.user_id) : undefined,
      q.action ? eq(auditLogs.action, q.action) : undefined,
      q.target_table ? eq(auditLogs.target_table, q.target_table) : undefined,
    );

    const rows = await db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.timestamp), desc(auditLogs.id))
      .offset((q.page - 1) * q.limit)
      .fetch(q.limit);

    const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(auditLogs).where(where);
    return { rows, total: Number(total) };
  },

  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
    return rows[0];
  },

  async create(data: typeof auditLogs.$inferInsert) {
    const db = await getDb();
    const [row] = await db.insert(auditLogs).output({ id: auditLogs.id }).values(data);
    return row!.id;
  },
};
