import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { users } from '../db/schema.ts';

// password_hash sengaja TIDAK ikut dipilih
const publicColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  created_at: users.created_at,
};

export const userRepository = {
  async findAll(role?: (typeof users.$inferSelect)['role']) {
    const db = await getDb();
    return db
      .select(publicColumns)
      .from(users)
      .where(role ? eq(users.role, role) : undefined)
      .orderBy(users.id);
  },

  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select(publicColumns).from(users).where(eq(users.id, id));
    return rows[0];
  },

  async findByEmail(email: string) {
    const db = await getDb();
    const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    return rows[0];
  },

  /** KHUSUS login: satu-satunya query yang mengambil password_hash (untuk dibandingkan bcrypt). */
  async findAuthByEmail(email: string) {
    const db = await getDb();
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        password_hash: users.password_hash,
      })
      .from(users)
      .where(eq(users.email, email));
    return rows[0];
  },

  async create(data: typeof users.$inferInsert) {
    const db = await getDb();
    const [row] = await db.insert(users).output({ id: users.id }).values(data);
    return row!.id;
  },
};
