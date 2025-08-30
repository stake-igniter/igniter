import crypto from 'crypto'
import {
  bigint,
  customType,
  integer,
  json,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { SupplierServiceConfig } from '@igniter/pocket'
import {
  addressStateEnum,
  KeyState,
} from './enums'
import { addressGroupTable } from './addressGroup'
import { delegatorsTable } from './delegator'

const algorithm = 'aes-256-cbc'

/**
 * Encrypts the provided text using AES encryption with a predefined initialization vector (IV)
 * and encryption key sourced from the environment variables.
 *
 * @param {string} text - The plain text string to be encrypted.
 * @return {string} The encrypted string, formatted as `IV:encryptedText`.
 */
export function encrypt(text: string): string {
  const iv = Buffer.from(process.env.ENCRYPTION_IV!, 'hex')
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypts the provided encrypted text using the predefined encryption key.
 *
 * @param {string} text - The encrypted text in the format "iv:encryptedData",
 *                         where "iv" is the initialization vector and
 *                         "encryptedData" is the ciphertext.
 * @return {string} The decrypted plain text.
 */
export function decrypt(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift()!, 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encryptedText, undefined, 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * Represents an encrypted text type with custom serialization and deserialization logic.
 *
 * This variable implements a custom type for handling encrypted strings.
 * It defines methods for transforming the data to and from a driver-compatible format,
 * using encryption and decryption mechanisms.
 *
 * The `dataType` method specifies the type of data as 'text'.
 * The `fromDriver` method handles decryption when retrieving data from the driver.
 * The `toDriver` method handles encryption when sending data to the driver.
 *
 * Note that the actual encryption and decryption logic relies on the `encrypt` and `decrypt` functions.
 */
const encryptedText = customType<{ data: string }>({
  dataType() {
    return 'text'
  },
  fromDriver(value: unknown) {
    return decrypt(value as string)
  },
  toDriver(value: string) {
    return encrypt(value)
  },
})

/**
 * Represents the database table structure for `keys` in the PostgreSQL database.
 *
 * This table is used to store information about cryptographic keys, their associated metadata,
 * and related relationships with other tables such as `delegatorsTable` and `addressGroupTable`.
 *
 * Fields:
 * - `id`: An auto-generated primary key identifier.
 * - `address`: A unique, non-nullable string representing the key's address.
 * - `publicKey`: A unique, non-nullable string representing the public key, with a maximum length of 66 characters.
 * - `privateKey`: An encrypted, non-nullable text field for storing private keys securely.
 * - `ownerAddress`: A string representing the address of the owner of this key, with a default value of an empty string.
 *   Note: This field is planned to be made non-nullable once data sanitization is complete (see issue #109).
 * - `state`: An enumerated value indicating the state of the key's address, with a non-nullable default state of `KeyState.Available`.
 * - `deliveredAt`: A timestamp indicating when the key was delivered.
 * - `deliveredTo`: A string representing the identity of the delegator to whom the key was delivered.
 *   This field references the `identity` column in the `delegatorsTable`.
 * - `addressGroupId`: An integer referencing the `id` column in the `addressGroupTable` to group addresses.
 * - `createdAt`: A timestamp marking when the record was created. Defaults to the current time.
 * - `updatedAt`: A timestamp marking when the record was last updated. Defaults to the current time and updates automatically.
 * - `lastUpdatedHeight`: An integer tracking the latest update operation's blockchain height, with a default value of 0.
 *   Updates to this field prevent writing records with a lower blockchain height.
 * - `stakeOwner`: A string representing the owner of the stake, with a default value of an empty string.
 * - `stakeAmountUpokt`: A big integer representing the staked amount in uPOKT, with a default value of `0`.
 * - `balanceUpokt`: A big integer representing the account balance in uPOKT, with a default value of `0`.
 * - `services`: A JSON array storing the services configuration (structured as `SupplierServiceConfig[]`),
 *   with a default value of an empty array.
 */
export const keysTable = pgTable('keys', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: varchar({ length: 255 }).unique().notNull(),
  publicKey: varchar({ length: 66 }).unique().notNull(),
  privateKey: encryptedText('privateKey').notNull(),
  // TODO: make it not null once all data is sanitized. See: https://github.com/stake-igniter/igniter/issues/109
  ownerAddress: varchar({ length: 255 }).default(''),
  state: addressStateEnum().notNull().default(KeyState.Available),
  deliveredAt: timestamp(),
  deliveredTo: varchar('delegator_identity').references(() => delegatorsTable.identity),
  addressGroupId: integer('address_group_id').references(() => addressGroupTable.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  // metadata coming from the blockchain
  lastUpdatedHeight: integer().default(0), // prevent updating this record with values of a lower height
  stakeOwner: varchar({ length: 255 }).default(''),
  stakeAmountUpokt: bigint({ mode: 'bigint' }).default(0n),
  balanceUpokt: bigint({ mode: 'bigint' }).default(0n),
  services: json('services').$type<SupplierServiceConfig[]>().default([]),
})

/**
 * Represents the relationships within the `keysTable` to other database tables.
 *
 * The `keysRelations` object defines the associations between the `keysTable` and:
 * - `addressGroupTable`: Establishes a one-to-one relationship based on the `addressGroupId` field from the `keysTable` and the `id` field from the `addressGroupTable`.
 * - `delegatorsTable`: Establishes a one-to-one relationship based on the `deliveredTo` field from the `keysTable` and the `identity` field from the `delegatorsTable`.
 *
 * This mapping is used for querying related data between the `keysTable` and its associated tables.
 */
export const keysRelations = relations(keysTable, ({ one }) => ({
  addressGroup: one(addressGroupTable, {
    fields: [keysTable.addressGroupId],
    references: [addressGroupTable.id],
  }),
  delegator: one(delegatorsTable, {
    fields: [keysTable.deliveredTo],
    references: [delegatorsTable.identity],
  }),
}))

/**
 * Represents a type definition for a `Key` derived from the structure of `keysTable.$inferSelect`.
 *
 * This type is a utility type that infers the structure of the selected key from the given table.
 * It is primarily used to ensure type safety when working with key-based operations in the context of the application.
 *
 * This type is generated dynamically based on the schema of `keysTable`.
 */
export type Key = typeof keysTable.$inferSelect;

/**
 * Type alias representing the inferred type for inserting data into the keys table.
 *
 * `InsertKey` is used to define the shape of data required when performing an
 * insert operation in the `keysTable`. It is derived from the `$inferInsert`
 * property to ensure consistency with the table's schema.
 */
export type InsertKey = typeof keysTable.$inferInsert;
