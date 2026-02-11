import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  // DATABASE_URL is provided by Render (and other platforms)
  // Format: postgresql://user:password@host:port/database
  DATABASE_URL: z.string().optional(),
  // Individual DB vars for local development
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('app_db'),
  DB_USER: z.string().default(process.env.USER || 'postgres'),
  DB_PASSWORD: z.string().default(''),
  // Auth
  JWT_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith('re_'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Helper to get database config (supports both DATABASE_URL and individual vars)
export function getDatabaseConfig() {
  if (env.DATABASE_URL) {
    return { connectionString: env.DATABASE_URL };
  }
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  };
}
