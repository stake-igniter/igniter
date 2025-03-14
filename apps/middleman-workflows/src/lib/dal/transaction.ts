import { db } from "../db";
import { Transaction, transactionsTable } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getTransaction(transactionId: number) {
  return await db.query.transactionsTable.findFirst({
    where: eq(transactionsTable.id, transactionId),
    with: { dependsOn: true },
  });
}

export async function getDependantTransactions(transactionId: number) {
  return await db.query.transactionsTable.findMany({
    where: eq(transactionsTable.dependsOn, transactionId),
  });
}

export async function createTransaction(transaction: Transaction) {
  return await db
    .insert(transactionsTable)
    .values(transaction)
    .returning()
    .then((res) => res[0]);
}

export async function updateTransaction(
  transactionId: number,
  payload: Partial<Transaction>
) {
  const transaction = await getTransaction(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }
  return await db
    .update(transactionsTable)
    .set(payload)
    .where(eq(transactionsTable.id, transaction.id))
    .returning()
    .then((res) => res[0]);
}
