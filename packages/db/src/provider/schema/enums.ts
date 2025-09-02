import { pgEnum } from 'drizzle-orm/pg-core'

/**
 * Converts an enum-like object to a tuple of PostgreSQL-compatible enum values.
 *
 * @param myEnum - The enum-like object to convert. It should be an object where keys are strings and values are the corresponding enum values.
 * @return A tuple containing the enum values as strings, where the first value is mandatory, followed by zero or more values.
 */
export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any
}

/**
 * Enumeration for defining different user roles within the application.
 *
 * This enum provides a set of pre-defined values to represent
 * specific roles a user can have, serving as a standard for
 * managing permissions and access levels throughout the system.
 *
 * Roles:
 * - Admin: Represents a user with administrative privileges.
 * - User: Represents a standard user with basic access.
 * - Owner: Represents a user who owns or manages certain resources.
 */
export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Owner = 'owner',
}

/**
 * The `roleEnum` variable represents a PostgreSQL enum type created for the "role" field.
 * It maps values from the `UserRole` enumeration to PostgreSQL enum values.
 * This enum is intended to define distinct user roles within the system
 * and to ensure consistent and validated data storage in the database.
 */
export const roleEnum = pgEnum('role', enumToPgEnum(UserRole))

/**
 * Enum representing various chain identifiers.
 *
 * This enum provides a collection of constants used to identify
 * different blockchain ids supported by the application.
 *
 * Keys:
 * - Pocket: Represents the Mainnet chain identifier.
 * - PocketBeta: Represents the Beta Testnet chain identifier.
 * - PocketAlpha: Represents the Alpha Testnet chain identifier.
 */
export enum ChainId {
  Pocket = 'pocket',
  PocketBeta = 'pocket-beta',
  PocketAlpha = 'pocket-alpha',
}

/**
 * An enumeration representing chain IDs, created as a PostgreSQL enum type.
 *
 * This variable establishes a mapping between the `chain_ids` PostgreSQL enumeration
 * and the JavaScript enum `ChainId`, enabling seamless integration between the
 * database and the application.
 *
 * The `chainIdEnum` facilitates type-safe interactions with database queries
 * and ensures consistency when referencing chain IDs within the application.
 *
 * Note: The `enumToPgEnum` function is used to convert the `ChainId` enum
 * into a format compatible with the PostgreSQL enumeration.
 */
export const chainIdEnum = pgEnum('chain_ids', enumToPgEnum(ChainId))

/**
 * Enum representing the various states of a key in the workflow.
 *
 * This enum is used to determine the current state of keys, such as their availability,
 * staking status, or if specific actions like staking or unstaking were successful or failed.
 *
 * Each state corresponds to a particular point within the lifecycle of a key.
 */
export enum KeyState {
  // I will probably add this state to later add a workflow to check if the imported keys are available, staked, etc.
  Imported = 'imported',
  Available = 'available',
  Delivered = 'delivered',
  Staking = 'staking',
  Staked = 'staked',
  StakeFailed = 'stake_failed',
  Unstaking = 'unstaking',
  Unstaked = 'unstaked',
}

/**
 * Enum representing the possible states of an address in a database.
 *
 * The `addressStateEnum` variable is derived from the PostgreSQL enum type `address_states`
 * and is mapped to the corresponding JavaScript enum using the `pgEnum` utility.
 *
 * It is used to encapsulate all the possible address states and ensure type safety
 * when interacting with the database*/
export const addressStateEnum = pgEnum('address_states', enumToPgEnum(KeyState))

/**
 * Enum representing types of provider fees.
 *
 * The `ProviderFee` enum specifies the format in which a fee can be applied,
 * offering flexibility for either fixed or variable (up to a certain amount) fee configurations.
 *
 * Members:
 * - `Up*/
export enum ProviderFee {
  UpTo = 'up_to',
  Fixed = 'fixed',
}

/**
 * Represents the enumeration for provider fees in the database.
 *
 * This variable uses `pgEnum` to define the PostgreSQL enumeration type `provider*/
export const providerFeeEnum = pgEnum(
  'provider_fee',
  enumToPgEnum(ProviderFee),
)
