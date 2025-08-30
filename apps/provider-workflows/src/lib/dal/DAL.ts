import type { Logger } from '@igniter/logger'
import type { DBClient } from '@igniter/db/connection'
import * as schema from '@igniter/db/provider/schema'
import Keys from '@/lib/dal/keys'

export default class DAL {
  logger: Logger

  dbClient: DBClient<typeof schema> | null = null

  keys: Keys
  // add more dal's below here

  constructor(dbClient: DBClient<typeof schema>, logger: Logger) {
    this.logger = logger
    this.dbClient = dbClient
    // Initialize all the DALs here
    this.keys = new Keys(dbClient, logger)
  }

  // add any common queries below
}
