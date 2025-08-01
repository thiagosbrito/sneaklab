import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema/index.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'aws-0-sa-east-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.ovluplweospdirelbzas',
    password: 'yNq04dAjgB3fgvMK',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
  verbose: true,
  strict: true,
})