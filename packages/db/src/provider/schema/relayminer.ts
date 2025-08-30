import { relations } from 'drizzle-orm'
import {
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import {
  Region,
  regionsTable,
} from './region'
import { usersTable } from './user'

/**
 * Represents the database table `relay_miners` which stores information about relay miners in the system.
 *
 * The table contains the following columns:
 * - `id`: A unique identifier for each record, automatically generated as an identity column.
 * - `name`: The name of the relay miner. This field is required.
 * - `identity`: A unique identifier string for the relay miner with a fixed length of 66 characters. This field is required.
 * - `regionId`: A foreign key referencing the `id` column in the `regions` table. Indicates the associated region. This field is required.
 * - `domain`: The domain of the relay miner. This field is required.
 * - `createdAt`: A timestamp marking when the record was created. Defaults to the current timestamp.
 * - `createdBy`: A foreign key referencing the `identity` column in the `users` table. Indicates the user who created the record. This field is required.
 * - `updatedAt`: A timestamp marking the last update time of the record. Defaults to the current timestamp and is automatically updated on change.
 * - `updatedBy`: A foreign key referencing the `identity` column in the `users` table. Indicates the user who last updated the record. This field is required.
 *
 * The following unique index is defined for this table:
 * - `uniqueIdentityRegion`: Ensures that the combination of `identity` and `regionId` is unique.
 */
export const relayMinersTable = pgTable('relay_miners', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  identity: varchar({ length: 66 }).notNull(),
  regionId: integer('region_id').references(() => regionsTable.id).notNull(),
  domain: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
}, (table) => {
  return {
    uniqueIdentityRegion: uniqueIndex('unique_identity_region_idx').on(table.identity, table.regionId),
  }
})

/**
 * Defines relations between the `relayMinersTable` and other database tables.
 *
 * @param {Function} relations - Function to define relationships between tables.
 * @param {Object} handler - An object that maps relation methods (e.g., `one` for one-to-one relationships).
 * @returns {Object} An object representing the defined relationships.
 *
 * The `relayMinersRelations` establishes a relationship between `relayMinersTable` and `regionsTable`, linking the two tables through a one-to-one relationship.
 * This is defined using the `regionId` field in `relayMinersTable` and the `id` field in `regionsTable` as the reference.
 */
export const relayMinersRelations = relations(relayMinersTable, ({ one }) => ({
  region: one(regionsTable, {
    fields: [relayMinersTable.regionId],
    references: [regionsTable.id],
  }),
}))

/**
 * RelayMiner is a TypeScript type representing the inferred select structure of the `relayMinersTable`.
 * The structure is automatically derived based on the database schema and query configuration.
 *
 * This type can be used to strongly type data retrieved or manipulated from the `relayMinersTable`,
 * ensuring type-safe interactions with this specific table in the database layer.
 *
 * It generally describes the shape of a single record/row in the `relayMinersTable`.
 *
 * Note: The actual structure of the type is based on the schema definition of the table and any transformations applied during inference.
 */
export type RelayMiner = typeof relayMinersTable.$inferSelect;

/**
 * Represents the inferred insert type for the `relayMinersTable`.
 * This type is used to define the structure of data when inserting entries into the table.
 * It ensures that the shape of the data aligns with the table's schema definition.
 *
 * This type is typically auto-generated and is based on the database schema.
 */
export type InsertRelayMiner = typeof relayMinersTable.$inferInsert;

/**
 * Represents a RelayMiner entity augmented with additional details, including its associated region.
 *
 * Combines properties of the RelayMiner type with an added region property for extended information.
 *
 * This type is typically used to provide a more detailed view of a RelayMiner, including regional context.
 */
export type RelayMinerWithDetails = RelayMiner & {
  region: Region,
};
