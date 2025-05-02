import { decrypt, encrypt } from "@/lib/crypto";
import {relations, sql} from "drizzle-orm";
import {
  boolean,
  customType,
  decimal,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
  json,
} from "drizzle-orm/pg-core";
import {RPCType} from "@/lib/models/supplier";
import {check} from "drizzle-orm/pg-core/checks";

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
  Pocket = "pocket",
  PocketBeta = "pocket-beta",
  PocketAlpha = "pocket-alpha",
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

export const keyManagementStrategyTypeEnum = pgEnum(
  "key_management_strategy_types",
  enumToPgEnum(KeyManagementStrategyType)
);

export const rpcTypeEnum = pgEnum("rpc_types", enumToPgEnum(RPCType));

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
  fee: decimal({ precision: 5, scale: 2 }).notNull(),
  domain: varchar({length: 255}).notNull(),
  delegatorRewardsAddress: varchar({ length: 255 }).notNull(),
  chainId: chainIdEnum().notNull(),
  minimumStake: integer().notNull(),
  isBootstrapped: boolean().notNull(),
  rpcUrl: varchar().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type ApplicationSettings = typeof applicationSettingsTable.$inferSelect;

export const addressesTable = pgTable("addresses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: varchar({ length: 255 }).notNull(),
  publicKey: varchar({ length: 66 }).notNull(),
  privateKey: encryptedText("privateKey").notNull(),
  origin: keyManagementStrategyTypeEnum().notNull(),
  state: addressStateEnum().notNull().default(AddressState.Available),
  deliveredAt: timestamp(),
  deliveredTo: varchar("delegator_identity").references(() => delegatorsTable.identity),
  addressGroupId: integer("address_group_id").references(
    () => addressGroupTable.id
  ),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const addressRelations = relations(addressesTable, ({ one }) => ({
  addressGroup: one(addressGroupTable, {
    fields: [addressesTable.addressGroupId],
    references: [addressGroupTable.id],
  }),
}));

export type Address = typeof addressesTable.$inferSelect;

export type CreateAddress = typeof addressesTable.$inferInsert;

export const addressGroupTable = pgTable("address_groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  region: varchar({ length: 255 }).notNull(),
  domain: varchar({ length: 255 }),
  clients: varchar().array().default([]),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const addressGroupServiceTable = pgTable("address_group_services", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  addressGroupId: integer().notNull().references(() => addressGroupTable.id),
  serviceId: varchar().notNull().references(() => servicesTable.serviceId),
  createdAt: timestamp().defaultNow(),
});


export const addressGroupRelations = relations(
  addressGroupTable,
  ({ many }) => ({
    addresses: many(addressesTable),
    services: many(addressGroupServiceTable),
  })
);

export const addressGroupServiceRelations = relations(addressGroupServiceTable, ({ one }) => ({
  addressGroup: one(addressGroupTable, {
    fields: [addressGroupServiceTable.addressGroupId],
    references: [addressGroupTable.id],
  }),
  service: one(servicesTable, {
    fields: [addressGroupServiceTable.serviceId],
    references: [servicesTable.serviceId],
  }),
}));


export type AddressGroup = typeof addressGroupTable.$inferSelect;

export type CreateAddressGroup = typeof addressGroupTable.$inferInsert;

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

export const servicesTable = pgTable("services",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    serviceId: varchar({ length: 255 }).notNull().unique(),
    name: varchar({ length: 255 }).notNull(),
    ownerAddress: varchar({ length: 255 }).notNull(),
    computeUnits: integer().notNull(),
    revSharePercentage: integer(),
    endpoints: json("endpoints").$type<{
      url: string;
      rpcType: RPCType;
    }[]>().notNull(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow(),
  },
  () => {
    return [
     check(
        "check_endpoints_not_empty",
        sql`json_array_length(endpoints) > 0`
      ),
    ];
  }
);

export const serviceRelations = relations(servicesTable, ({ many }) => ({
  addressGroups: many(addressGroupServiceTable),
}));


export type Service = typeof servicesTable.$inferSelect;
export type CreateService = typeof servicesTable.$inferInsert;



