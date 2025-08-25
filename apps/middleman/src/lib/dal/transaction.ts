import { db } from '@/db'
import {CreateTransaction, Transaction, transactionsTable} from "@/db/schema";
import {eq} from "drizzle-orm";

export async function getTransactionsByUser(userIdentity: string) {
  return db.query.transactionsTable.findMany({
    where: eq(transactionsTable.createdBy, userIdentity),
    with: {
      provider: true,
    }
  });
}

export async function getTransactions() {
    return db.query.transactionsTable.findMany({
        with: {
            provider: true,
        }
    });
}

export async function insert(transaction: CreateTransaction): Promise<Transaction> {
  const [createdTransaction] = await db.insert(transactionsTable).values(transaction).returning();
  if (!createdTransaction) {
    throw new Error("Failed to insert transaction");
  }
  return createdTransaction;
}
