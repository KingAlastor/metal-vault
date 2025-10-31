import postgres from "postgres";

// Load environment variables using @next/env for consistent loading
// Only load if not already in Next.js runtime
if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  const { loadEnvConfig } = require('@next/env');
  loadEnvConfig(process.cwd());
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set in db.ts!");
}

export const sql = postgres(databaseUrl, {});
