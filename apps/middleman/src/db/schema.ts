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
  Stake = "stake",
  Unstake = "unstake",
  Upstake = "upstake",
  OperationalFunds = "operational_funds",
}

export enum TransactionType {
  Stake = "stake",
  Unstake = "unstake",
  Send = "send",
}

export enum ActivityStatus {
  Pending = "pending",
  Success = "success",
  Failure = "failure",
}

export enum TransactionStatus {
  Pending = "pending",
  Success = "success",
  Failure = "failure",
  NotExecuted = "not_executed",
}

export const activityTypeEnum = pgEnum("type", enumToPgEnum(ActivityType));

export const activityStatusEnum = pgEnum(
  "status",
  enumToPgEnum(ActivityStatus)
);

export const transactionTypeEnum = pgEnum(
  "type",
  enumToPgEnum(TransactionType)
);

export const transactionStatusEnum = pgEnum(
  "status",
  enumToPgEnum(TransactionStatus)
);

export const roleEnum = pgEnum("role", enumToPgEnum(UserRole));

export const chainIdEnum = pgEnum("chain_ids", enumToPgEnum(ChainId));

export const blockchainProtocolEnum = pgEnum(
  "protocols",
  enumToPgEnum(BlockchainProtocol)
);

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
  minimumStake: integer().notNull().default(0),
  operationalFunds: integer().notNull().default(5),
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
  fee: decimal({ precision: 5, scale: 2 }).notNull(),
  minimumStake: integer().notNull().default(15000),
  isBootstrapped: boolean().notNull(),
  chainId: chainIdEnum().notNull(),
  blockchainProtocol: blockchainProtocolEnum().notNull(),
  privacyPolicy: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type ApplicationSettings = typeof applicationSettingsTable.$inferSelect;

export const activityTable = pgTable("activity", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: activityTypeEnum().notNull(),
  status: activityStatusEnum().notNull(),
  seenOn: timestamp(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const activityTransactionRelation = relations(
  activityTable,
  ({ many }) => ({
    transactions: many(transactionsTable),
  })
);

export type Activity = typeof activityTable.$inferSelect;

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

  signedPayload: varchar(),
  signatureTimestamp: timestamp().notNull(),
  activityId: integer()
    .notNull()
    .references(() => activityTable.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const transactionsActivityRelation = relations(
  transactionsTable,
  ({ one }) => ({
    activity: one(activityTable, {
      fields: [transactionsTable.activityId],
      references: [activityTable.id],
    }),
  })
);

export const transactionsDependsOnRelation = relations(
  transactionsTable,
  ({ one }) => ({
    dependsOn: one(transactionsTable, {
      fields: [transactionsTable.dependsOn],
      references: [transactionsTable.id],
    }),
  })
);

export type Transaction = typeof transactionsTable.$inferSelect;
