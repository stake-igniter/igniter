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
  primaryKey,
} from 'drizzle-orm/pg-core'

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

export enum TransactionType {
  Stake = "Stake",
  Unstake = "Unstake",
  Upstake = "Upstake",
  OperationalFunds = "Operational Funds",
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
  Unstaked = "unstaked",
  Unstaking = "unstaking",
}

export enum ProviderFee {
  UpTo = "up_to",
  Fixed = "fixed",
}

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

export const providerFeeEnum = pgEnum(
  "provider_fee",
  enumToPgEnum(ProviderFee)
);

export const roleEnum = pgEnum("role", enumToPgEnum(UserRole));

export const chainIdEnum = pgEnum("chain_ids", enumToPgEnum(ChainId));

export const nodeStatusEnum = pgEnum("node_status", enumToPgEnum(NodeStatus));

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identity: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }),
  role: roleEnum().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
});

export type User = typeof usersTable.$inferSelect;

export const providersTable = pgTable("providers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  identity: varchar({ length: 255 }).notNull().unique(),
  url: varchar({ length: 255 }).notNull(),
  enabled: boolean().notNull(),
  visible: boolean().notNull().default(true),
  fee: decimal(),
  feeType: providerFeeEnum(),
  domains: text().array().default([]),
  regions: text().array().default([]),
  status: providerStatusEnum().notNull().default(ProviderStatus.Unknown),
  minimumStake: integer().notNull().default(0),
  operationalFunds: integer().notNull().default(5),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  createdBy: varchar().references(() => usersTable.identity).notNull(),
  updatedBy: varchar().references(() => usersTable.identity).notNull(),
});

export const providersRelations = relations(providersTable, ({ many }) => ({
  nodes: many(nodesTable),
  transactions: many(transactionsTable),
}));

export type Provider = typeof providersTable.$inferSelect;

export const applicationSettingsTable = pgTable("application_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  appIdentity: varchar().notNull(),
  supportEmail: varchar({ length: 255 }),
  ownerEmail: varchar({ length: 255 }),
  ownerIdentity: varchar({ length: 255 }).notNull(),
  fee: decimal({ precision: 5, scale: 2 }).notNull(),
  minimumStake: integer().notNull().default(15000),
  isBootstrapped: boolean().notNull(),
  chainId: chainIdEnum().notNull(),
  delegatorRewardsAddress: varchar({ length: 255 }).notNull(),
  rpcUrl: varchar().notNull(),
  privacyPolicy: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  createdBy: varchar().references(() => usersTable.identity).notNull(),
  updatedBy: varchar().references(() => usersTable.identity).notNull(),
});

export type ApplicationSettings = typeof applicationSettingsTable.$inferSelect;
export type CreateApplicationSettings = typeof applicationSettingsTable.$inferInsert;

export const transactionsTable = pgTable("transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  hash: varchar({ length: 255 }),
  type: transactionTypeEnum().notNull(),
  status: transactionStatusEnum().notNull(),
  code: integer(),
  log: text(),
  executionHeight: integer(),
  executionTimestamp: timestamp(),
  verificationHeight: integer(),
  verificationTimestamp: timestamp(),

  //Self-referencing foreign key workaround: https://orm.drizzle.team/docs/indexes-constraints#foreign-key
  dependsOn: integer().references((): AnyPgColumn => transactionsTable.id),

  signedPayload: varchar().notNull(),
  fromAddress: varchar({ length: 255 }).notNull(),
  unsignedPayload: varchar().notNull(),
  estimatedFee: integer().notNull(),
  consumedFee: integer().notNull(),
  providerFee: integer(),
  typeProviderFee: providerFeeEnum(),
  providerId: varchar().references(() => providersTable.identity),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().$onUpdateFn(() => new Date()),
  createdBy: varchar().references(() => usersTable.identity).notNull(),
});

export const transactionsRelations = relations(
  transactionsTable,
  ({ one, many }) => ({
    dependsOn: one(transactionsTable, {
      fields: [transactionsTable.dependsOn],
      references: [transactionsTable.id],
    }),
    createdBy: one(usersTable, {
      fields: [transactionsTable.createdBy],
      references: [usersTable.identity],
    }),
    provider: one(providersTable, {
      fields: [transactionsTable.providerId],
      references: [providersTable.identity],
    }),
    transactionsToNodes: many(transactionsToNodesTable),
  })
);

export type Transaction = typeof transactionsTable.$inferSelect;
export type CreateTransaction = typeof transactionsTable.$inferInsert;

export const nodesTable = pgTable("nodes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: varchar({ length: 255 }).notNull(),
  ownerAddress: varchar({ length: 255 }).notNull(),
  status: nodeStatusEnum().notNull(),
  stakeAmount: varchar().notNull(),
  balance: bigint({ mode: "number" }).notNull(),
  providerId: varchar().references(() => providersTable.identity),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow(),
  createdBy: varchar().references(() => usersTable.identity).notNull(),
});

export type Node = typeof nodesTable.$inferSelect;

export type NodeWithDetails = Node & {
  provider: Provider | null;
  transactionsToNodes: TransactionsToNodes[];
};

export type CreateNode = typeof nodesTable.$inferInsert;

export const nodesRelations = relations(nodesTable, ({ one, many }) => ({
  provider: one(providersTable, {
    fields: [nodesTable.providerId],
    references: [providersTable.identity],
  }),
  createdBy: one(usersTable, {
    fields: [nodesTable.createdBy],
    references: [usersTable.identity],
  }),
  transactionsToNodes: many(transactionsToNodesTable),
}));

export const transactionsToNodesTable = pgTable("transactions_to_nodes", {
    transactionId: integer().notNull().references(() => transactionsTable.id),
    nodeId: integer().notNull().references(() => nodesTable.id),
  },
  (t) => [
    primaryKey({ columns: [t.transactionId, t.nodeId] })
  ]
)

export type CreateTransactionsToNodesRelation = typeof transactionsToNodesTable.$inferInsert;

export type TransactionsToNodes = typeof transactionsToNodesTable.$inferSelect;

export const transactionsToNodesRelations = relations(transactionsToNodesTable, ({ one }) => ({
  transaction: one(transactionsTable, {
    fields: [transactionsToNodesTable.transactionId],
    references: [transactionsTable.id],
  }),
  node: one(nodesTable, {
    fields: [transactionsToNodesTable.nodeId],
    references: [nodesTable.id],
  }),
}));
