import { neon } from '@neondatabase/serverless';

type Attendance = 'si' | 'no';

export type RsvpRecord = {
  id: number;
  name: string;
  guests: number;
  attendance: Attendance;
  created_at: string;
};

let sqlClient: ReturnType<typeof neon> | null = null;
let setupPromise: Promise<void> | null = null;

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  if (!sqlClient) {
    sqlClient = neon(connectionString);
  }

  return sqlClient;
}

async function ensureTable() {
  if (!setupPromise) {
    const sql = getSql();
    setupPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS rsvps (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 12),
          attendance TEXT NOT NULL CHECK (attendance IN ('si', 'no')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS rsvps_created_at_idx ON rsvps (created_at DESC)`;
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }

  await setupPromise;
}

export async function createRsvp(input: {
  name: string;
  guests: number;
  attendance: Attendance;
}) {
  await ensureTable();
  const sql = getSql();
  const rows = await sql<RsvpRecord[]>`
    INSERT INTO rsvps (name, guests, attendance)
    VALUES (${input.name}, ${input.guests}, ${input.attendance})
    RETURNING id, name, guests, attendance, created_at
  `;
  return rows[0];
}

export async function getRsvps() {
  await ensureTable();
  const sql = getSql();
  return sql<RsvpRecord[]>`
    SELECT id, name, guests, attendance, created_at
    FROM rsvps
    ORDER BY created_at DESC
  `;
}
