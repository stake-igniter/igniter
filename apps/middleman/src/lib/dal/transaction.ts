import { db } from '@/db'

export async function getTransactionsByUser() {
  return db.query.transactionsTable.findMany({
    with: {
      provider: true,
    }
  });
}
