import type { Logger } from '@igniter/logger'
import type { DBClient } from '@igniter/db/connection'
import * as schema from '@igniter/db/provider/schema'
import Keys from '@/lib/dal/keys'
import Services from "@/lib/dal/services";
import Settings from "@/lib/dal/settings";

export default class DAL {
  logger: Logger

  dbClient: DBClient<typeof schema> | null = null

  keys: Keys
  services: Services
  settings: Settings
  // add more dal's below here

  constructor(dbClient: DBClient<typeof schema>, logger: Logger) {
    this.logger = logger
    this.dbClient = dbClient
    // Initialize all the DALs here
    this.keys = new Keys(dbClient, logger.child({ context: 'Keys' }))
    this.services = new Services(dbClient, logger.child({ context: 'Services' }))
    this.settings = new Settings(dbClient, logger.child({ context: 'Settings' }))
  }

  // add any common queries below
}
