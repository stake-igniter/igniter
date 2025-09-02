import type { Logger } from '@igniter/logger'
import * as schema from './schema'
import { setup } from '@/connection'
import { DBClient } from '@/types'

export const getDb = async (logger: Logger): Promise<DBClient<typeof schema>> => {
  if ((globalThis as any).dbClient) {
    return (globalThis as any).dbClient
  }
  (globalThis as any).dbClient = await setup<typeof schema>({ schema, logger })
  return (globalThis as any).dbClient
}

export {
  schema,
}
