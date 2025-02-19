declare module '@env' {
  export const env: {
    PORT: number
    NODE_ENV: 'development' | 'production' | 'test'
    API_URL: string
    FRONTEND_URL: string
    DATABASE_URL: string
    WHATSAPP_API_KEY: string
    TELEGRAM_BOT_TOKEN: string
  }
} 