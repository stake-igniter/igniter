import { Logger } from '@igniter/logger'
import type {
  Logger as TemporalLogger,
  LogLevel,
} from '@temporalio/worker'

export function getTemporalLogger(logger: Logger): TemporalLogger {
  // Wrap it into Temporal-compatible logger interface
  return {
    debug: (msg, meta) => logger.debug(meta ?? {}, msg),
    info: (msg, meta) => logger.info(meta ?? {}, msg),
    warn: (msg, meta) => logger.warn(meta ?? {}, msg),
    error: (msg, meta) => logger.error(meta ?? {}, msg),
    trace: (msg, meta) => logger.trace(meta ?? {}, msg),
    log: (level: LogLevel, msg: string, meta?: Record<string, unknown>) => {
      switch (level) {
        case 'TRACE':
          logger.trace(meta ?? {}, msg)
          break
        case 'DEBUG':
          logger.debug(meta ?? {}, msg)
          break
        case 'INFO':
          logger.info(meta ?? {}, msg)
          break
        case 'WARN':
          logger.warn(meta ?? {}, msg)
          break
        case 'ERROR':
          logger.error(meta ?? {}, msg)
          break
        default:
          logger.info(meta ?? {}, msg)
          break
      }
    },
  }
}
