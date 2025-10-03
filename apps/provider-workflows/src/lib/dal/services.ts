import type {Logger} from '@igniter/logger'
import * as schema from "@igniter/db/provider/schema";
import type {DBClient} from '@igniter/db/connection'
import {Service} from "@igniter/db/provider/schema";

export default class Services {
  logger: Logger

  dbClient: DBClient<typeof schema>

  /**
   * Constructs a new instance of the class.
   *
   * @param {DBClient<typeof schema>} dbClient - The database client instance used for database operations.
   * @param {Logger} logger - The logger instance used for logging activities in the application.
   */
  constructor(dbClient: DBClient<typeof schema>, logger: Logger) {
    this.logger = logger
    this.dbClient = dbClient
  }

  async loadServices(): Promise<Service[]> {
    this.logger.debug('loadServices: Execution Started')
    const services = await this.dbClient.db
      .select()
      .from(schema.servicesTable)
      .then(r => (r.length ? r : []))
    this.logger.debug('loadServices: Execution Finished', {
      totalServices: services.length,
      services: services.map(s => s.serviceId)
    });
    return services;
  }
}