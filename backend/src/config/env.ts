import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string(),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),

  // API
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_URL: z.string().url().default('http://localhost:3333'),

  // Frontend URL (CORS)
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // WhatsApp API
  WHATSAPP_API_URL: z.string().default('https://api.whatsapp.com/v1'),
  WHATSAPP_API_KEY: z.string(),

  // Telegram Bot Token
  TELEGRAM_BOT_TOKEN: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format())
  throw new Error('Invalid environment variables.')
}

export const env = _env.data

// Tipos
export type Env = z.infer<typeof envSchema>
