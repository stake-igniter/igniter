import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any;
}

export enum UserRole {
  Admin = "admin",
  User = "user",
  Owner = "owner",
}

export enum MinimumStakeIncrement {
  "15k" = "15000",
  "30k" = "30000",
  "45k" = "45000",
  "60k" = "60000",
}

export enum ChainId {
  Mainnet = "mainnet",
  Testnet = "testnet",
}

export enum BlockchainProtocol {
  Morse = "morse",
  Shannon = "shannon",
}

export const roleEnum = pgEnum("role", enumToPgEnum(UserRole));

export const minimumStakeIncrementEnum = pgEnum(
  "minimum_stake_increment",
  enumToPgEnum(MinimumStakeIncrement)
);

export const chainIdEnum = pgEnum("chain_ids", enumToPgEnum(ChainId));

export const blockchainProtocolEnum = pgEnum(
  "protocols",
  enumToPgEnum(BlockchainProtocol)
);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identity: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique(),
  role: roleEnum().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;

export const providersTable = pgTable("providers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  publicKey: varchar({ length: 255 }).notNull().unique(),
  url: varchar({ length: 255 }).notNull(),
  enabled: boolean().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type Provider = typeof providersTable.$inferSelect;

export const applicationSettingsTable = pgTable("application_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  supportEmail: varchar({ length: 255 }),
  ownerEmail: varchar({ length: 255 }),
  ownerIdentity: varchar({ length: 255 }).notNull(),
  middlemanFee: decimal({ precision: 5, scale: 2 }).notNull(),
  minimumStakeIncrement: minimumStakeIncrementEnum(),
  isBootstrapped: boolean().notNull(),
  chainId: chainIdEnum().notNull(),
  blockchainProtocol: blockchainProtocolEnum().notNull(),
  privacyPolicy: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type ApplicationSettings = typeof applicationSettingsTable.$inferSelect;
