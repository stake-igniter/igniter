import {
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { usersTable } from './user'

/**
 * Represents the database table 'regions'.
 *
 * This table is used to store information about different regions, such as their
 * display names, URL values, and metadata related to their creation and updates.
 *
 * Structure:
 * - `id`: A unique identifier for the region, generated automatically as an identity column.
 * - `displayName`: A unique and required string representing the display name of the region, limited to 20 characters.
 * - `urlValue`: A unique and required string representing the URL-friendly identifier of the region, limited to 20 characters.
 * - `createdAt`: A timestamp for when the region entry was created, automatically set to the current time by default.
 * - `createdBy`: A required foreign key referencing the identity column in the 'users' table, indicating the user who created the entry.
 * - `updatedAt`: A timestamp for when the region entry was last updated, automatically set to the current time and updates whenever changes are made.
 * - `updatedBy`: A required foreign key referencing the identity column in the 'users' table, indicating the user who last updated the entry.
 */
export const regionsTable = pgTable('regions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  displayName: varchar({ length: 20 }).unique().notNull(),
  urlValue: varchar({ length: 20 }).unique().notNull(),
  createdAt: timestamp().defaultNow(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
})

/**
 * Represents a Region entity, which describes a specific geographical or logical region.
 * The type is inferred based on the structure of the `regionsTable` using its selected properties.
 * Typically used to type-check region data retrieved from the database or other data sources.
 */
export type Region = typeof regionsTable.$inferSelect;

/**
 * Represents a type that infers the shape of data to be inserted into the `regionsTable`.
 *
 * This type is derived from the table schema using `$inferInsert`, which ensures data
 * adheres to the structure defined in the `regionsTable`.
 */
export type InsertRegion = typeof regionsTable.$inferInsert;

