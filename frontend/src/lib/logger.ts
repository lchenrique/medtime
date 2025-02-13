// Define níveis de log
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Configuração que permite habilitar/desabilitar logs por ambiente
const config = {
  isProduction: import.meta.env.PROD,
  enableDebugLogs: import.meta.env.DEV
}

class Logger {
  private static instance: Logger
  
  private constructor() {}
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    if (config.isProduction && level === 'debug') return false
    return true
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug') && config.enableDebugLogs) {
      console.debug('[DEBUG]', ...args)
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args)
    }
  }
}

export const logger = Logger.getInstance()