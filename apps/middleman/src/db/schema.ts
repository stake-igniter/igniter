import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  AnyPgColumn,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  bigint,
  uuid,
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

export enum ActivityType {
  Stake = "Stake",
  Unstake = "Unstake",
  Upstake = "Upstake",
  OperationalFunds = "Operational Funds",
}

export enum TransactionType {
  Stake = "Stake",
  Unstake = "Unstake",
  Upstake = "Upstake",
  OperationalFunds = "Operational Funds",
}

export enum ActivityStatus {
  Pending = "pending",
  Success = "success",
  Failure = "failure",
  InProgress = "in_progress",
}

export enum TransactionStatus {
  Pending = "pending",
  Success = "success",
  Failure = "failure",
  NotExecuted = "not_executed",
}

export enum ProviderStatus {
  Healthy = "healthy",
  Unhealthy = "unhealthy",
  Unknown = "unknown",
  Unreachable = "unreachable",
}

export enum NodeStatus {
  Staked = "staked",
  Staking = "staking",
  Unstaked = "unstaked",
  Unstaking = "unstaking",
}

export const activityTypeEnum = pgEnum(
  "activity_type",
  enumToPgEnum(ActivityType)
);

export const activityStatusEnum = pgEnum(
  "activity_status",
  enumToPgEnum(ActivityStatus)
);

export const transactionTypeEnum = pgEnum(
  "tx_type",
  enumToPgEnum(TransactionType)
);

export const transactionStatusEnum = pgEnum(
  "tx_status",
  enumToPgEnum(TransactionStatus)
);

export const providerStatusEnum = pgEnum(
  "provider_status",
  enumToPgEnum(ProviderStatus)
);

export const roleEnum = pgEnum("role", enumToPgEnum(UserRole));

export const chainIdEnum = pgEnum("chain_ids", enumToPgEnum(ChainId));

export const blockchainProtocolEnum = pgEnum(
  "blockchain_protocols",
  enumToPgEnum(BlockchainProtocol)
);

export const nodeStatusEnum = pgEnum("node_status", enumToPgEnum(NodeStatus));

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identity: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }),
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
  visible: boolean().notNull().default(true),
  fee: decimal().notNull().default("1.00"),
  domains: text().array().default([]),
  status: providerStatusEnum().notNull().default(ProviderStatus.Unknown),
  delegatorRewardsAddress: varchar({ length: 255 }).default(''),
  minimumStake: integer().notNull().default(0),
  operationalFunds: integer().notNull().default(5),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const providersRelations = relations(providersTable, ({ many }) => ({
  nodes: many(nodesTable),
}));

export type Provider = typeof providersTable.$inferSelect;

export const applicationSettingsTable = pgTable("application_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  appIdentity: uuid().defaultRandom().notNull(),
  supportEmail: varchar({ length: 255 }),
  ownerEmail: varchar({ length: 255 }),
  ownerIdentity: varchar({ length: 255 }).notNull(),
  fee: decimal({ precision: 5, scale: 2 }).notNull(),
  minimumStake: integer().notNull().default(15000),
  isBootstrapped: boolean().notNull(),
  chainId: chainIdEnum().notNull(),
  blockchainProtocol: blockchainProtocolEnum().notNull(),
  delegatorRewardsAddress: varchar({ length: 255 }).notNull(),
  privacyPolicy: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type ApplicationSettings = typeof applicationSettingsTable.$inferSelect;

export const activityTable = pgTable("activity", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: activityTypeEnum().notNull(),
  status: activityStatusEnum().notNull().default(ActivityStatus.Pending),
  seenOn: timestamp(),
  totalValue: integer().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow(),
  userId: integer().references(() => usersTable.id),
});

export const activityTransactionRelation = relations(
  activityTable,
  ({ many, one }) => ({
    transactions: many(transactionsTable),
    createdBy: one(usersTable, {
      fields: [activityTable.userId],
      references: [usersTable.id],
    }),
  })
);

export type BaseActivity = typeof activityTable.$inferSelect;

export const transactionsTable = pgTable("transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  hash: varchar({ length: 255 }),
  type: transactionTypeEnum().notNull(),
  status: transactionStatusEnum().notNull(),
  executionHeight: integer(),
  executionTimestamp: timestamp(),
  verificationHeight: integer(),
  verificationTimestamp: timestamp(),

  //Self-referencing foreign key workaround: https://orm.drizzle.team/docs/indexes-constraints#foreign-key
  dependsOn: integer().references((): AnyPgColumn => transactionsTable.id),

  signedPayload: varchar().notNull(),
  fromAddress: varchar({ length: 255 }).notNull(),
  activityId: integer().references(() => activityTable.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
  userId: integer().references(() => usersTable.id),
});

export const transactionsRelations = relations(
  transactionsTable,
  ({ one }) => ({
    activity: one(activityTable, {
      fields: [transactionsTable.activityId],
      references: [activityTable.id],
    }),
    dependsOn: one(transactionsTable, {
      fields: [transactionsTable.dependsOn],
      references: [transactionsTable.id],
    }),
    createdBy: one(usersTable, {
      fields: [transactionsTable.userId],
      references: [usersTable.id],
    }),
  })
);

export type Transaction = typeof transactionsTable.$inferSelect;

export const nodesTable = pgTable("nodes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: varchar({ length: 255 }).notNull(),
  status: nodeStatusEnum().notNull(),
  stakeAmount: integer().notNull(),
  balance: bigint({ mode: "number" }).notNull(),
  rewards: bigint({ mode: "number" }).notNull(),
  serviceUrl: varchar({ length: 255 }),
  chains: varchar({ length: 255 }).array(),
  providerId: integer(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow(),
  userId: integer().references(() => usersTable.id),
});

export const nodesRelations = relations(nodesTable, ({ one }) => ({
  provider: one(providersTable, {
    fields: [nodesTable.providerId],
    references: [providersTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [nodesTable.userId],
    references: [usersTable.id],
  }),
}));

export type Node = typeof nodesTable.$inferSelect;
export type NewNode = typeof nodesTable.$inferInsert;
export type Activity = typeof activityTable.$inferSelect & {
  transactions: Transaction[];
};
