import { decrypt, encrypt } from "@/lib/crypto";
import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  decimal,
  integer,
  pgEnum,
  pgTable,
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

export enum ChainId {
  Mainnet = "mainnet",
  Testnet = "testnet",
}

export enum BlockchainProtocol {
  Morse = "morse",
  Shannon = "shannon",
}

export enum KeyManagementStrategyType {
  Dynamic = "dynamic",
  Manual = "manual",
}

export enum AddressState {
  Available = 'available',
  Delivered = 'delivered',
  Staking = 'staking',
  Staked = 'staked',
  StakeFailed = 'stake_failed',
  Unstaking = 'unstaking',
  Unstaked = 'unstaked',
}

const encryptedText = customType<{ data: string }>({
  dataType() {
    return "text";
  },
  fromDriver(value: unknown) {
    return decrypt(value as string);
  },
  toDriver(value: string) {
    return encrypt(value);
  },
});

export const roleEnum = pgEnum("role", enumToPgEnum(UserRole));

export const chainIdEnum = pgEnum("chain_ids", enumToPgEnum(ChainId));

export const blockchainProtocolEnum = pgEnum(
  "protocols",
  enumToPgEnum(BlockchainProtocol)
);

export const keyManagementStrategyTypeEnum = pgEnum(
  "key_management_strategy_types",
  enumToPgEnum(KeyManagementStrategyType)
);

export const addressStateEnum = pgEnum("address_states", enumToPgEnum(AddressState));

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identity: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }),
  role: roleEnum().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;

export const applicationSettingsTable = pgTable("application_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  supportEmail: varchar({ length: 255 }),
  ownerIdentity: varchar({ length: 255 }).notNull(),
  ownerEmail: varchar({ length: 255 }),
  providerFee: decimal({ precision: 5, scale: 2 }).notNull(),
  delegatorRewardsAddress: varchar({ length: 255 }).notNull(),
  chainId: chainIdEnum().notNull(),
  blockchainProtocol: blockchainProtocolEnum().notNull(),
  minimumStake: integer().notNull(),
  isBootstrapped: boolean().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type ApplicationSettings = typeof applicationSettingsTable.$inferSelect;

export const chainsTable = pgTable("chains", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  chainId: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type Chain = typeof chainsTable.$inferSelect;

export const addressesTable = pgTable("addresses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: varchar({ length: 255 }).notNull(),
  publicKey: varchar({ length: 64 }).notNull(),
  privateKey: encryptedText("privateKey").notNull(),
  origin: keyManagementStrategyTypeEnum().notNull(),
  state: addressStateEnum().notNull().default(AddressState.Available),
  deliveredAt: timestamp(),
  deliveredTo: integer("delegator_identity").references(() => delegatorsTable.identity),
  addressGroupId: integer("address_group_id").references(
    () => addressGroupTable.id
  ),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const addressGroupRelations = relations(addressesTable, ({ one }) => ({
  addressGroup: one(addressGroupTable, {
    fields: [addressesTable.addressGroupId],
    references: [addressGroupTable.id],
  }),
}));

export type Address = typeof addressesTable.$inferSelect;

export type CreateAddress = typeof addressesTable.$inferInsert;

export const addressGroupTable = pgTable("address_groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identity: varchar({ length: 255 }).notNull().unique(),
  domain: varchar({ length: 255 }).notNull(),
  pattern: varchar({ length: 255 }).notNull(),
  defaultChains: varchar({ length: 255 }).array().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const groupAddressRelation = relations(
  addressGroupTable,
  ({ many }) => ({
    addresses: many(addressesTable),
  })
);

export type AddressGroup = typeof addressGroupTable.$inferSelect;

export const keyManagementStrategyColumns = {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  weight: integer().notNull().unique(),
  addressGroupAssignment: varchar({ length: 255 }).notNull(),
  type: keyManagementStrategyTypeEnum().notNull(),
  disabled: boolean().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
};

export const keyManagementStrategyTable = pgTable("key_management_strategies", {
  ...keyManagementStrategyColumns,
});

export type KeyManagementStrategy =
  typeof keyManagementStrategyTable.$inferSelect;

export const delegatorsTable = pgTable("delegators", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  identity: varchar({ length: 255 }).notNull().unique(),
  publicKey: varchar({ length: 255 }).notNull().unique(),
  enabled: boolean().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

