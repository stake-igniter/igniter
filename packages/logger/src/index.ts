import { pino } from 'pino'
import pretty from 'pino-pretty'

// Define separate streams
const streams = process.env.NODE_ENV === 'development'
  ? [{
    level: 'debug',
    stream: pretty({
      colorize: true,
      translateTime: true,
      ignore: 'pid,hostname',
    }),
  }] : [
    { level: 'debug', stream: process.stdout }, // debug, info → stdout
    { level: 'warn', stream: process.stderr },  // warn, error → stderr
  ]

// Create a base logger
const baseLogger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
  },
  pino.multistream(streams, { dedupe: true }),
)

export type Logger = typeof baseLogger

export function getLogger() {
  return baseLogger
}
