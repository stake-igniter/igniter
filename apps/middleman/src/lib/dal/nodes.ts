import "server-only";
import { getDb } from "@/db";
import {desc, eq, sql} from 'drizzle-orm'
import {
  nodesTable,
  NodeWithDetails,
} from '@igniter/db/middleman/schema'

export async function getNodesByUser(userIdentity: string) {
  return getDb().query.nodesTable.findMany({
    where: eq(nodesTable.createdBy, userIdentity),
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

export async function getNode(address: string): Promise<NodeWithDetails | undefined> {
  return getDb().query.nodesTable.findFirst({
    where: eq(nodesTable.address, address),
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

export async function getOwnerAddressesByUser(userIdentity: string) {
  const result = await getDb().execute(
    sql`
    SELECT DISTINCT ${nodesTable.ownerAddress}
    FROM ${nodesTable}
    WHERE ${nodesTable.createdBy} = ${userIdentity}
  `
  );

  return result.rows.map((row) => row.ownerAddress as string);
}

// TODO: filter for staked nodes only when we handle this state
export async function getStakedNodesAddress() {
  return await getDb().query.nodesTable.findMany({
    columns: {
      address: true,
    }
  }).then((nodes) => nodes.map((node) => node.address));
}
