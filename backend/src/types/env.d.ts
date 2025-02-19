interface Env {
  PORT: number
  NODE_ENV: 'development' | 'production' | 'test'
  API_URL: string
  FRONTEND_URL: string
  DATABASE_URL: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  WHATSAPP_API_KEY: string
  TELEGRAM_BOT_TOKEN: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
} 