import {
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { usersTable } from './user'

/**
 * Represents the schema for the "delegators" table in the database.
 *
 * This table stores information about delegators, including their unique identity,
 * status, and metadata related to creation or updates.
 *
 * Table Fields:
 * - id: A unique identifier for the delegator. Auto-generated as an identity column.
 * - name: The name of the delegator. Cannot be null.
 * - identity: A unique string representing the delegator's identity. Cannot be null.
 * - enabled: A boolean indicating whether the delegator is enabled. Cannot be null.
 * - createdAt: The timestamp when the record was created. Defaults to the current timestamp.
 * - createdBy: A reference to the identity of the user who created the record. Cannot be null.
 * - updatedAt: The timestamp when the record was last updated. Auto-updated on modification.
 * - updatedBy: A reference to the identity of the user who last updated the record. Cannot be null.
 */
export const delegatorsTable = pgTable('delegators', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  identity: varchar({ length: 66 }).notNull().unique(),
  enabled: boolean().notNull(),
  createdAt: timestamp().defaultNow(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
})

/**
 * Represents the type inferred from the result of selecting data from the delegatorsTable.
 * This type is dynamically generated based on the structure of the delegatorsTable in the database.
 * It is used to define the expected shape of data returned when querying the table.
 */
export type Delegator = typeof delegatorsTable.$inferSelect;

/**
 * Represents the type for handling insert operations associated with a delegator.
 * Extracts and infers the insert type structure from the given `delegatorsTable`.
 */
export type InsertDelegator = typeof delegatorsTable.$inferInsert;
