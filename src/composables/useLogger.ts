import { ref, type Ref } from 'vue'

// Define log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SUCCESS = 'success'
}

// Define the structure of a notification
export interface Notification {
  level: LogLevel
  message: string
  debugInfo?: any
  timestamp?: string
}

// Define the structure of the logger
export interface Logger {
  logs: Ref<Notification[]>
  toConsole: (message: string, level: LogLevel, debugging?: any) => void
  info: (message: string, debugging?: any) => void
  warn: (message: string, debugging?: any) => void
  error: (message: string, debugging?: any) => void
  success: (message: string, debugging?: any) => void
  reset: () => void
}

const DEV_MODE = 'development'
const ENV_MODE = import.meta.env.MODE || 'production'

export function useLogger(): Logger {
  const logs = ref<Notification[]>([])

  const toConsole = (message: string, level: LogLevel = LogLevel.INFO, debugInfo?: any) => {
    const method = level === LogLevel.SUCCESS ? 'log' : level
    console[method](message, debugInfo)
  }

  const log = (message: string, level: LogLevel = LogLevel.INFO, debugInfo?: any) => {
    // Check if a similar notification already exists in the logs
    const similarNotificationExists = logs.value.some(
      (log) => log.level === level && log.message === message && log.debugInfo === debugInfo
    )

    // Exit with error if that notification already exists
    if (!similarNotificationExists) return null

    // Only log to console in dev mode
    if (ENV_MODE === DEV_MODE) toConsole(message, level, debugInfo)

    const timestamp = new Date().toISOString()
    logs.value.push({ level, message, debugInfo, timestamp })
  }

  const reset = () => (logs.value.length = 0)

  return {
    logs,
    toConsole,
    info: (message, debugInfo) => log(message, LogLevel.INFO, debugInfo),
    warn: (message, debugInfo) => log(message, LogLevel.WARN, debugInfo),
    error: (message, debugInfo) => log(message, LogLevel.ERROR, debugInfo),
    success: (message, debugInfo) => log(message, LogLevel.SUCCESS, debugInfo),
    reset
  }
}
