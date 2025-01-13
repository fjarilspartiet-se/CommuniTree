import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';

// Check for required environment variable
if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create postgres connection
const client = postgres(env.DATABASE_URL);

// Create drizzle database instance
export const db = drizzle(client);
