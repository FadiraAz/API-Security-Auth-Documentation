import { and, count, eq, like } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { menuItems, stalls } from '../db/schema.ts';
import type { ListMenuItemQuery } from '../dtos/menuItem.dto.ts';

// Kolom hasil JOIN dengan STALLS
const withStall = {
  id: menuItems.id,
  name: menuItems.name,
  price: menuItems.price,
  is_available: menuItems.is_available,
  stall: {
    id: stalls.id,
    name: stalls.name,
    category: stalls.category,
    location: stalls.location,
  },
};

export const menuItemRepository = {
  async findAll(q: ListMenuItemQuery) {
    const db = await getDb();
    const where = and(
      q.stall_id ? eq(menuItems.stall_id, q.stall_id) : undefined,
      q.is_available ? eq(menuItems.is_available, q.is_available === 'true') : undefined,
      q.q ? like(menuItems.name, `%${q.q}%`) : undefined,
    );

    const rows = await db
      .select(withStall)
      .from(menuItems)
      .innerJoin(stalls, eq(menuItems.stall_id, stalls.id))
      .where(where)
      .orderBy(menuItems.id)
      .offset((q.page - 1) * q.limit)
      .fetch(q.limit);

    const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(menuItems).where(where);
    return { rows, total: Number(total) };
  },

  async findById(id: number) {
    const db = await getDb();
    const rows = await db
      .select(withStall)
      .from(menuItems)
      .innerJoin(stalls, eq(menuItems.stall_id, stalls.id))
      .where(eq(menuItems.id, id));
    return rows[0];
  },

  async create(data: typeof menuItems.$inferInsert) {
    const db = await getDb();
    const [row] = await db.insert(menuItems).output({ id: menuItems.id }).values(data);
    return row!.id;
  },

  async update(id: number, data: Partial<typeof menuItems.$inferInsert>) {
    const db = await getDb();
    await db.update(menuItems).set(data).where(eq(menuItems.id, id));
  },

  async delete(id: number) {
    const db = await getDb();
    await db.delete(menuItems).where(eq(menuItems.id, id));
  },
};
