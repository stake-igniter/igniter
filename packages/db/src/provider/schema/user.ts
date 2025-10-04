import {
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { roleEnum } from './enums'


/**
 * Represents the 'users' table structure in the PostgreSQL database.
 * Defines the schema and column configurations for managing user-related data.
 *
 * The table includes the following columns:
 * - id: Unique identifier for each user. Serves as the primary key and is auto-generated.
 * - identity: A non-nullable, unique string representing a user's identity. Maximum length is 255 characters.
 * - email: An optional string storing the user's email address. Maximum length is 255 characters.
 * - role: A non-nullable enumeration defining the user's role in the system.
 * - createdAt: The timestamp indicating when the record was created. Defaults to the current date and time.
 * - updatedAt: The timestamp indicating when the record was last updated. Automatically updates based on a predefined function.
 */
export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identity: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }),
  role: roleEnum().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
})

/**
 * Represents a User entity inferred from the structure of the `usersTable`.
 *
 * The `User` type is automatically generated based on the database schema
 * and reflects the structure of the `usersTable` at runtime. It is used
 * for type safety and consistency when interacting with user-related data.
 *
 * This type ensures that the properties and types align with the inferred
 * database record for the `usersTable`.
 *
 * Note: Updates to the `usersTable` schema may affect the inferred structure
 * of this type.
 */
export type User = typeof usersTable.$inferSelect;

/**
 * Represents the structure inferred for inserting data into a usersTable.
 *
 * This type is derived from the database table definition and defines the necessary
 * fields required for inserting a user record. The structure ensures consistency
 * with the database schema and may include optional or mandatory fields
 * based on the table's configuration.
 *
 * The definition is dynamically generated using the $inferInsert utility,
 * which maps the table's properties to an appropriate TypeScript interface for
 * insert operations.
 *
 * Use this type to validate input data before inserting records into the usersTable.
 */
export type InsertUser = typeof usersTable.$inferInsert;
