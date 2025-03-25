import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
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

export enum SystemEvent {
  SystemBootstrapped = "system_bootstrapped",
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

export const systemEventEnum = pgEnum("type", enumToPgEnum(SystemEvent));

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identity: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique(),
  role: roleEnum().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;

export const systemEventsTable = pgTable("system_events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: systemEventEnum().notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const providersTable = pgTable("providers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  publicKey: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type Provider = typeof providersTable.$inferSelect;

export const applicationSettingsTable = pgTable("application_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  configuredChain: varchar({ length: 255 }).notNull(),
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
