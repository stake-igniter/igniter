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

export enum KeyState {
  // I will probably add this state to later add a workflow to check if the imported keys are available, staked, etc.
  // Imported = 'imported',
  Available = 'available',
  Delivered = 'delivered',
  Staking = 'staking',
  Staked = 'staked',
  StakeFailed = 'stake_failed',
  Unstaking = 'unstaking',
  Unstaked = 'unstaked',
}

export enum ProviderFee {
  UpTo = "up_to",
  Fixed = "fixed",
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

export const addressStateEnum = pgEnum("address_states", enumToPgEnum(KeyState));

export const providerFeeEnum = pgEnum(
  "provider_fee",
  enumToPgEnum(ProviderFee)
);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identity: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }),
  role: roleEnum().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date())
});

export type User = typeof usersTable.$inferSelect;

export const applicationSettingsTable = pgTable("application_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  appIdentity: varchar({ length: 66 }).notNull(),
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
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
});

export type ApplicationSettings = typeof applicationSettingsTable.$inferSelect;
export type CreateApplicationSettings = typeof applicationSettingsTable.$inferInsert;

export const keysTable = pgTable("keys", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // todo: this shouldn't be unique?
  address: varchar({ length: 255 }).notNull(),
  publicKey: varchar({ length: 66 }).notNull(),
  privateKey: encryptedText("privateKey").notNull(),
  state: addressStateEnum().notNull().default(KeyState.Available),
  deliveredAt: timestamp(),
  deliveredTo: varchar("delegator_identity").references(() => delegatorsTable.identity),
  addressGroupId: integer("address_group_id").references(
    () => addressGroupTable.id
  ),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
});

export const keysRelations = relations(keysTable, ({ one }) => ({
  addressGroup: one(addressGroupTable, {
    fields: [keysTable.addressGroupId],
    references: [addressGroupTable.id],
  }),
  delegator: one(delegatorsTable, {
    fields: [keysTable.deliveredTo],
    references: [delegatorsTable.identity],
  })
}));

export type Key = typeof keysTable.$inferSelect;

export type CreateKey = typeof keysTable.$inferInsert;

export const addressGroupTable = pgTable("address_groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  region: varchar({ length: 255 }).notNull(),
  domain: varchar({ length: 255 }),
  clients: varchar().array().default([]),
  private: boolean().notNull().default(false),
  services: varchar().array().default([]),
  createdAt: timestamp().defaultNow(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
});

export const addressGroupRelations = relations(
  addressGroupTable,
  ({ many }) => ({
    addresses: many(keysTable),
  })
);

export type AddressGroup = typeof addressGroupTable.$inferSelect;

export type CreateAddressGroup = typeof addressGroupTable.$inferInsert;

export type AddressGroupWithDetails = AddressGroup & {
  keysCount: number;
}

export const delegatorsTable = pgTable("delegators", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  identity: varchar({ length: 66 }).notNull().unique(),
  enabled: boolean().notNull(),
  createdAt: timestamp().defaultNow(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
});

export type Delegator = typeof delegatorsTable.$inferSelect;
export type CreateDelegator = typeof delegatorsTable.$inferInsert;

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
    createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
    updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
    updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
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


export type Service = typeof servicesTable.$inferSelect;
export type CreateService = typeof servicesTable.$inferInsert;



