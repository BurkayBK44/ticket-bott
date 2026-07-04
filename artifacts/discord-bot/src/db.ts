import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tanımlanmamış. Veritabanı oluşturulduğundan emin olun.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface PanelCategory {
  name: string;
  emoji: string;
  color: string;
}

export interface TicketConfig {
  guild_id: string;
  log_channel_id: string | null;
  authorized_roles: string[];
}

export interface TicketPanel {
  guild_id: string;
  channel_id: string | null;
  message_id: string | null;
  categories: PanelCategory[];
}

export interface Ticket {
  id: number;
  guild_id: string;
  user_id: string;
  channel_id: string;
  category: string | null;
  status: "open" | "closed";
  created_at: Date;
  closed_at: Date | null;
  closed_by: string | null;
}

export async function initDB(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticket_configs (
      guild_id TEXT PRIMARY KEY,
      log_channel_id TEXT,
      authorized_roles TEXT[] DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ticket_panels (
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT,
      message_id TEXT,
      categories JSONB DEFAULT '[]',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      closed_at TIMESTAMPTZ,
      closed_by TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_open ON tickets(guild_id, user_id, status);
    CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_one_open_per_user
      ON tickets(guild_id, user_id) WHERE status = 'open';
  `);
}

// --- Config ---

export async function getConfig(guildId: string): Promise<TicketConfig | null> {
  const res = await pool.query<TicketConfig>(
    "SELECT * FROM ticket_configs WHERE guild_id = $1",
    [guildId]
  );
  return res.rows[0] ?? null;
}

export async function upsertConfig(
  guildId: string,
  data: Partial<Omit<TicketConfig, "guild_id">>
): Promise<void> {
  const current = await getConfig(guildId);
  if (!current) {
    await pool.query(
      `INSERT INTO ticket_configs (guild_id, log_channel_id, authorized_roles)
       VALUES ($1, $2, $3)`,
      [guildId, data.log_channel_id ?? null, data.authorized_roles ?? []]
    );
  } else {
    const fields: string[] = [];
    const values: unknown[] = [guildId];
    if (data.log_channel_id !== undefined) {
      values.push(data.log_channel_id);
      fields.push(`log_channel_id = $${values.length}`);
    }
    if (data.authorized_roles !== undefined) {
      values.push(data.authorized_roles);
      fields.push(`authorized_roles = $${values.length}`);
    }
    if (fields.length > 0) {
      fields.push("updated_at = NOW()");
      await pool.query(
        `UPDATE ticket_configs SET ${fields.join(", ")} WHERE guild_id = $1`,
        values
      );
    }
  }
}

// --- Panel ---

export async function getPanel(guildId: string): Promise<TicketPanel | null> {
  const res = await pool.query<TicketPanel>(
    "SELECT * FROM ticket_panels WHERE guild_id = $1",
    [guildId]
  );
  return res.rows[0] ?? null;
}

export async function upsertPanel(
  guildId: string,
  data: Partial<Omit<TicketPanel, "guild_id">>
): Promise<void> {
  const current = await getPanel(guildId);
  if (!current) {
    await pool.query(
      `INSERT INTO ticket_panels (guild_id, channel_id, message_id, categories)
       VALUES ($1, $2, $3, $4)`,
      [
        guildId,
        data.channel_id ?? null,
        data.message_id ?? null,
        JSON.stringify(data.categories ?? []),
      ]
    );
  } else {
    const fields: string[] = [];
    const values: unknown[] = [guildId];
    if (data.channel_id !== undefined) {
      values.push(data.channel_id);
      fields.push(`channel_id = $${values.length}`);
    }
    if (data.message_id !== undefined) {
      values.push(data.message_id);
      fields.push(`message_id = $${values.length}`);
    }
    if (data.categories !== undefined) {
      values.push(JSON.stringify(data.categories));
      fields.push(`categories = $${values.length}`);
    }
    if (fields.length > 0) {
      fields.push("updated_at = NOW()");
      await pool.query(
        `UPDATE ticket_panels SET ${fields.join(", ")} WHERE guild_id = $1`,
        values
      );
    }
  }
}

// --- Tickets ---

export async function getUserOpenTicket(
  guildId: string,
  userId: string
): Promise<Ticket | null> {
  const res = await pool.query<Ticket>(
    "SELECT * FROM tickets WHERE guild_id = $1 AND user_id = $2 AND status = 'open' LIMIT 1",
    [guildId, userId]
  );
  return res.rows[0] ?? null;
}

export async function getTicketByChannel(channelId: string): Promise<Ticket | null> {
  const res = await pool.query<Ticket>(
    "SELECT * FROM tickets WHERE channel_id = $1 AND status = 'open' LIMIT 1",
    [channelId]
  );
  return res.rows[0] ?? null;
}

export async function getUserOpenTickets(
  guildId: string,
  userId: string
): Promise<Ticket[]> {
  const res = await pool.query<Ticket>(
    "SELECT * FROM tickets WHERE guild_id = $1 AND user_id = $2 AND status = 'open'",
    [guildId, userId]
  );
  return res.rows;
}

export async function createTicket(
  guildId: string,
  userId: string,
  channelId: string,
  category: string
): Promise<Ticket> {
  const res = await pool.query<Ticket>(
    `INSERT INTO tickets (guild_id, user_id, channel_id, category)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [guildId, userId, channelId, category]
  );
  return res.rows[0]!;
}

export async function closeTicket(
  channelId: string,
  closedBy: string
): Promise<Ticket | null> {
  const res = await pool.query<Ticket>(
    `UPDATE tickets
     SET status = 'closed', closed_at = NOW(), closed_by = $2
     WHERE channel_id = $1 AND status = 'open'
     RETURNING *`,
    [channelId, closedBy]
  );
  return res.rows[0] ?? null;
}
