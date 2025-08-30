import {
  integer,
  json,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { check } from 'drizzle-orm/pg-core/checks'
import {
  relations,
  sql,
} from 'drizzle-orm'
import { RPCType } from '@igniter/pocket'
import { usersTable } from './user'
import { addressGroupServicesTable } from './addressGroup'

/**
 * Represents the 'services' table in the PostgreSQL database.
 *
 * The `servicesTable` contains metadata and configuration details for services.
 * It is defined with constraints, default values, references, and validations.
 *
 * Table columns:
 * - `id`: A unique primary key for each service, auto-generated as an identity value.
 * - `serviceId`: A unique identifier for the service, stored as a non-null character-varying string with a maximum length of 255.
 * - `name`: The name of the service, stored as a non-null character-varying string with a maximum length of 255.
 * - `ownerAddress`: The address of the service owner, stored as a non-null character-varying string with a maximum length of 255.
 * - `computeUnits`: An integer representing the compute units allocated to the service, cannot be null.
 * - `revSharePercentage`: An optional integer representing the revenue share percentage for the service.
 * - `endpoints`: A non-null JSON array field storing an array of endpoint objects, where each object contains:
 *   - `url`: The URL of the endpoint.
 *   - `rpcType`: The type of RPC (Remote Procedure Call) for the endpoint.
 * - `createdAt`: A timestamp indicating when the service record was created, with a default value of the current timestamp.
 * - `createdBy`: A non-null character-varying string representing the identifier of the user who created the service record. References the `identity` column in the `usersTable`.
 * - `updatedAt`: A timestamp indicating when the service record was last updated. Automatically updates to the current timestamp on modification.
 * - `updatedBy`: A non-null character-varying string representing the identifier of the user who last updated the service record. References the `identity` column in the `usersTable`.
 *
 * Constraints:
 * - `check_endpoints_not_empty`: Ensures that the `endpoints` JSON field contains at least one entry by enforcing that its array length is greater than zero.
 */
export const servicesTable = pgTable('services',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    serviceId: varchar({ length: 255 }).notNull().unique(),
    name: varchar({ length: 255 }).notNull(),
    ownerAddress: varchar({ length: 255 }).notNull(),
    computeUnits: integer().notNull(),
    revSharePercentage: integer(),
    endpoints: json('endpoints').$type<{
      url: string;
      rpcType: RPCType;
    }[]>().notNull(),
    createdAt: timestamp().defaultNow(),
    createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
    updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
    updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  },
  () => {
    return [
      check(
        'check_endpoints_not_empty',
        sql`json_array_length(endpoints) > 0`,
      ),
    ]
  },
)

/**
 * Represents a Service object type inferred from the `servicesTable` table definition.
 *
 * This type is used to define the structure of the data selected from the `servicesTable`.
 * It leverages the `$inferSelect` utility to dynamically infer the shape of the object
 * based on the table's schema definition.
 *
 * Use this type to ensure type safety when working with records from the `servicesTable`.
 */
export type Service = typeof servicesTable.$inferSelect;

/**
 * Represents a type that infers the structure of an "insert" operation
 * from the specified services table.
 *
 * This type is generated based on the structure of the `servicesTable`
 * and is used to ensure that any data inserted into the table adheres
 * to the defined schema.
 *
 * Typically, this is used in database operations to strongly type
 * the data being inserted to guarantee consistency and correctness.
 */
export type InsertService = typeof servicesTable.$inferInsert;

/**
 * Defines the relationships for the `servicesTable`.
 *
 * @constant {Object} servicesRelations
 *
 * The `servicesRelations` object establishes the relationship between
 * the `servicesTable` and the `addressGroupServicesTable` through a
 * one-to-many association using the `many` relation function.
 *
 * - `addressGroups`: Represents a one-to-many relationship between `servicesTable`
 *   and `addressGroupServicesTable`.
 */
export const servicesRelations = relations(
  servicesTable,
  ({ many }) => ({
    addressGroups: many(addressGroupServicesTable),
  }),
)
