import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { nodeStatusEnum } from './enums'
import {
  Provider,
  providersTable,
} from './provider'
import { usersTable } from './users'
import {
  Transaction,
  transactionsTable,
} from './transaction'


export const nodesTable = pgTable('nodes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: varchar({ length: 255 }).notNull(),
  ownerAddress: varchar({ length: 255 }).notNull(),
  status: nodeStatusEnum().notNull(),
  stakeAmount: varchar().notNull(),
  balance: bigint({ mode: 'number' }).notNull(),
  providerId: varchar().references(() => providersTable.identity),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow(),
  createdBy: varchar().references(() => usersTable.identity).notNull(),
})

export type Node = typeof nodesTable.$inferSelect;

export type NodeWithDetails = Node & {
  provider: Provider | null;
  transactionsToNodes: TransactionsToNodes[];
};

export type InsertNode = typeof nodesTable.$inferInsert;

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
}))

export const transactionsToNodesTable = pgTable('transactions_to_nodes', {
    transactionId: integer().notNull().references(() => transactionsTable.id),
    nodeId: integer().notNull().references(() => nodesTable.id),
  },
  (t) => [
    primaryKey({ columns: [t.transactionId, t.nodeId] }),
  ],
)

export type InsertTransactionsToNodesRelation = typeof transactionsToNodesTable.$inferInsert;

export type TransactionsToNodes = typeof transactionsToNodesTable.$inferSelect;

export type TransactionsToNodesWithDetails = TransactionsToNodes & {
  transaction: Transaction;
  node: Node;
};

export const transactionsToNodesRelations = relations(transactionsToNodesTable, ({ one }) => ({
  transaction: one(transactionsTable, {
    fields: [transactionsToNodesTable.transactionId],
    references: [transactionsTable.id],
  }),
  node: one(nodesTable, {
    fields: [transactionsToNodesTable.nodeId],
    references: [nodesTable.id],
  }),
}))
