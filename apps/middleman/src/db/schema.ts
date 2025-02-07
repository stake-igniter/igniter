import {
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

export const roleEnum = pgEnum("role", enumToPgEnum(UserRole));

export const systemEventEnum = pgEnum("type", enumToPgEnum(SystemEvent));

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identity: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique(),
  role: roleEnum().notNull(),
  createdAt: timestamp().defaultNow(),
});

export const systemEventsTable = pgTable("system_events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: systemEventEnum().notNull(),
  createdAt: timestamp().defaultNow(),
});

export const providersTable = pgTable("providers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  publicKey: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
});
