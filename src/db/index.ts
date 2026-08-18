import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.SUPABASE_POSTGRES_URL || '';

if (!connectionString && typeof window === 'undefined') {
  console.warn('SUPABASE_POSTGRES_URL not set. Database queries will fail.');
}

// Create connection pool (only on server)
const client = typeof window === 'undefined' 
  ? postgres(connectionString)
  : null;

// Drizzle instance
export const db = client ? drizzle(client) : null;

export type Database = typeof db;
