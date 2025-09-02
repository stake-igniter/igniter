import type { Logger } from '@igniter/logger'
import * as schema from './schema'
import { setup } from '@/connection'
import { DBClient } from '@/types'

export const getDb = function<TSchema extends Record<string, unknown>>(logger: Logger): DBClient<TSchema> {
  logger.info('Getting DBClient')
  if ((globalThis as any).dbClient) {
    logger.info('DBClient already exists')
    return (globalThis as any).dbClient
  }
  (globalThis as any).dbClient = setup({ schema, logger })
  logger.info('DBClient created')
  return (globalThis as any).dbClient
}
