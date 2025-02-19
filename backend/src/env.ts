import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  PORT: z.string().transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  API_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string(),
  WHATSAPP_PHONE_NUMBER_ID: z.string(),
  WHATSAPP_ACCESS_TOKEN: z.string(),
  WHATSAPP_TEST_NUMBER: z.string(),
  WHATSAPP_VERIFY_TOKEN: z.string(),
  TELEGRAM_BOT_TOKEN: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  JWT_SECRET: z.string(),
})

export const env = envSchema.parse(process.env)