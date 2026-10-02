import { Pool } from "pg";

let pool: Pool | undefined;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return url;
}

export function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: { rejectUnauthorized: true },
    });
  }
  return pool;
}

export async function dbQuery<T extends import("pg").QueryResultRow = any>(text: string, values: unknown[] = []) {
  return getDb().query<T>(text, values);
}
