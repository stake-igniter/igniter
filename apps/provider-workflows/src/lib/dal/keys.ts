import type { DBClient } from '@igniter/db/connection'
import { asc } from 'drizzle-orm/sql/expressions/select'
import { sql } from 'drizzle-orm'
import {
  and,
  eq,
  gt,
  lte,
  ne,
} from 'drizzle-orm/sql/expressions/conditions'
import * as schema from '@igniter/db/provider/schema'
import {
  Key,
  keysTable,
} from '@igniter/db/provider/schema'
import { KeyState } from '@igniter/db/provider/enums'
import type { Logger } from '@igniter/logger'

export type KeysMinMax = { total: number, minId: number, maxId: number }

/**
 * Represents a utility class for performing operations related to "keys" in the system.
 * Provides methods for querying information about keys from the database and implementing key-related logic.
 */
export default class Keys {
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

  /**
   * Loads a key associated with the specified address from the database.
   *
   * @param {string} address - The address whose key is to be retrieved.
   * @return {Promise<Key | undefined>} - A promise that resolves to the key if found, or undefined if no key is associated with the address.
   */
  async loadKey(address: string): Promise<Key | undefined> {
    return this.dbClient.db
      .select()
      .from(keysTable)
      .where(eq(keysTable.address, address))
      .limit(1)
      .then(rows => rows.length ? rows[0] : undefined)
  }

  /**
   * Retrieves the total count of keys, as well as the minimum and maximum key IDs from the database.
   *
   * @return {Promise<KeysMinMax>}
   * A promise that resolves to an object containing the total count of keys,
   * the minimum key ID, and the maximum key ID. If the query returns no rows,
   * the result will contain 0 for `total` and `minId`, and `maxId` will be null.
   */
  async getKeysMinAndMax(): Promise<KeysMinMax> {
    const rows = await this.dbClient.db
      .select({
        total: sql<number>`count(*)::int`.as('total'),
        minId: sql<number | null>`min(${schema.keysTable.id})::int`.as('minId'),
        maxId: sql<number | null>`max(${keysTable.id})::int`.as('maxId'),
      })
      .from(keysTable)

    if (!rows || rows.length === 0) {
      return { total: 0, minId: 0, maxId: 0 }
    }

    return rows[0] as KeysMinMax
  }

  /**
   * Fetches a range of keys based on the provided ID parameters and state conditions.
   *
   * @param {number} afterId - The starting ID (exclusive). If null, starts from the smallest possible ID.
   * @param {number} endId - The ending ID (inclusive).
   * @return {Promise<any>} A promise that resolves to the list of keys with their IDs and addresses
   *                        that match the conditions.
   */
  async loadKeysInRange(afterId: number, endId: number): Promise<any> {
    afterId = afterId - 1
    const where = and(
      afterId === null ? gt(keysTable.id, -2147483648) : gt(keysTable.id, afterId),
      lte(keysTable.id, endId),
      ne(keysTable.state, KeyState.Available),
      ne(keysTable.state, KeyState.Unstaked),
    )

    return this.dbClient.db
      .select({ id: keysTable.id, address: keysTable.address })
      .from(keysTable)
      .where(where)
      .orderBy(asc(keysTable.id))
  }

  /**
   * Updates the key information for the specified address in the database.
   *
   * @param {string} address - The unique identifier of the key to be updated.
   * @param {Partial<schema.InsertKey>} update - The partial object containing the key properties to be updated.
   * @param {number} [lastUpdatedHeight=-1] - The maximum last updated height to consider for updates. Defaults to -1.
   * @return {Promise<any>} A promise that resolves when the update operation is complete.
   */
  async updateKey(address: string, update: Partial<schema.InsertKey>, lastUpdatedHeight: number = -1): Promise<any> {
    return this.dbClient.db.update(keysTable)
      .set(update)
      .where(
        and(
          lte(keysTable.lastUpdatedHeight, lastUpdatedHeight),
          eq(keysTable.address, address),
        ),
      )
  }
}
