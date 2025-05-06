import "server-only";
import { db } from "@/db";
import { desc } from 'drizzle-orm'

export async function getNodesByUser() {
  return await db.query.nodesTable.findMany({
    with: {
      provider: true,
      transactionsToNodes: {
        with: {
          transaction: true,
        },
        limit: 10,
        // here we can't order directly by cratedAt of transactionsToNodes because findMany doesn't support orderBy on relations
        orderBy: (t) => [desc(t.transactionId)]
      },
    },
  });
}
