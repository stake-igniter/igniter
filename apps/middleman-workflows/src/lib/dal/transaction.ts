import { db } from "../db";
import {Transaction, transactionsTable, TransactionStatus} from "../db/schema";
import { eq } from "drizzle-orm";

export async function getTransaction(transactionId: number) {
  return db.query.transactionsTable.findFirst({
    where: eq(transactionsTable.id, transactionId),
  });
}

export async function listByStatus(status: TransactionStatus) {
  return db.query.transactionsTable.findMany({
    where: eq(transactionsTable.status, status)
  });
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
