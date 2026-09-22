import winston from 'winston'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Tell winston to use the colors
winston.addColors(colors)

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console(),

  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/all.log',
  }),
]

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
})

// Helper functions for common log patterns
export const logError = (message: string, error?: any, context?: any) => {
  logger.error(message, {
    error: error?.message || error,
    stack: error?.stack,
    context,
  })
}

export const logWarning = (message: string, context?: any) => {
  logger.warn(message, { context })
}

export const logInfo = (message: string, context?: any) => {
  logger.info(message, { context })
}

export const logDebug = (message: string, context?: any) => {
  logger.debug(message, { context })
}

// Log API requests
export const logApiRequest = (
  method: string,
  path: string,
  userId?: string,
  ip?: string,
  requestId?: string
) => {
  logger.http(`${method} ${path}`, {
    requestId,
    userId,
    ip,
  })
}

// Log API errors
export const logApiError = (
  method: string,
  path: string,
  error: any,
  userId?: string,
  ip?: string,
  requestId?: string
) => {
  logger.error(`${method} ${path} - ERROR`, {
    requestId,
    error: error?.message || error,
    stack: error?.stack,
    userId,
    ip,
  })
}

export default logger
