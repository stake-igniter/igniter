import { decrypt, encrypt } from "@/lib/crypto";
import {relations, sql} from "drizzle-orm";
import {
  boolean,
  customType,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
  json,
  primaryKey,
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
  chainId: chainIdEnum().notNull(),
  minimumStake: integer().notNull(),
  isBootstrapped: boolean().notNull(),
  rpcUrl: varchar().notNull(),
  indexerApiUrl: varchar(),
  updatedAtHeight: varchar(),
  createdAt: timestamp().defaultNow(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
});

export type ApplicationSettings = typeof applicationSettingsTable.$inferSelect;
export type CreateApplicationSettings = typeof applicationSettingsTable.$inferInsert;

export const keysTable = pgTable("keys", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: varchar({ length: 255 }).unique().notNull(),
  publicKey: varchar({ length: 66 }).unique().notNull(),
  privateKey: encryptedText("privateKey").notNull(),
  // TODO: make it not null once all data is sanitized. See: https://github.com/stake-igniter/igniter/issues/109
  ownerAddress: varchar({ length: 255 }).default(''),
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

export const servicesRelations = relations(
  servicesTable,
  ({ many }) => ({
    addressGroups: many(addressGroupServicesTable),
  })
)

export const regionsTable = pgTable("regions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  displayName: varchar({ length: 20 }).unique().notNull(),
  urlValue: varchar({ length: 20 }).unique().notNull(),
  createdAt: timestamp().defaultNow(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
});

export type Region = typeof regionsTable.$inferSelect;
export type CreateRegion = typeof regionsTable.$inferInsert;

export const relayMinersTable = pgTable("relay_miners", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  identity: varchar({ length: 66 }).notNull().unique(),
  regionId: integer("region_id").references(() => regionsTable.id).notNull(),
  domain: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
});

export const relayMinersRelations = relations(relayMinersTable, ({ one }) => ({
  region: one(regionsTable, {
    fields: [relayMinersTable.regionId],
    references: [regionsTable.id],
  }),
}));

export type RelayMiner = typeof relayMinersTable.$inferSelect;
export type RelayMinerWithDetails = RelayMiner & { region: Region };
export type CreateRelayMiner = typeof relayMinersTable.$inferInsert;

export const addressGroupTable = pgTable("address_groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  linkedAddresses: varchar().array().default([]),
  private: boolean().notNull().default(false),
  relayMinerId: integer("relay_miner_id")
      .references(() => relayMinersTable.id, { onDelete: 'restrict' })
      .notNull(),
  createdAt: timestamp().defaultNow(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  updatedBy: varchar({ length: 255 }).references(() => usersTable.identity).notNull(),
});

export type AddressGroup = typeof addressGroupTable.$inferSelect;

export type CreateAddressGroup = typeof addressGroupTable.$inferInsert;

export type AddressGroupWithDetails = AddressGroup & {
  keysCount: number;
  addressGroupServices: AddressGroupService[];
  relayMiner: RelayMinerWithDetails;
}

export const addressGroupsRelations = relations(
  addressGroupTable,
  ({ many, one }) => ({
    addresses: many(keysTable),
    addressGroupServices: many(addressGroupServicesTable),
    relayMiner: one(relayMinersTable, {
      fields: [addressGroupTable.relayMinerId],
      references: [relayMinersTable.id],
    }),
  })
);

export const addressGroupServicesTable = pgTable(
  "address_group_services",
  {
    addressGroupId: integer("address_group_id")
      .notNull()
      .references(() => addressGroupTable.id),

    serviceId: varchar("service_id")
      .notNull()
      .references(() => servicesTable.serviceId),

    addSupplierShare: boolean().notNull().default(false),

    supplierShare: integer().default(0),

    revShare: json("revShare")
      .$type<{ address: string; share: number }[]>()
      .notNull()
      .default([]),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.addressGroupId, table.serviceId] }),
  }),
);

export type AddressGroupService = typeof addressGroupServicesTable.$inferSelect & {
  service: {
    name: string;
  }
};

export type CreateAddressGroupService = typeof addressGroupServicesTable.$inferInsert;

export  const addressGroupServicesRelations = relations(
  addressGroupServicesTable,
  ({ one }) => ({
    addressGroup: one(addressGroupTable, {
      fields: [addressGroupServicesTable.addressGroupId],
      references: [addressGroupTable.id],
    }),
    service: one(servicesTable, {
      fields: [addressGroupServicesTable.serviceId],
      references: [servicesTable.serviceId],
    })
  }),
);

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
