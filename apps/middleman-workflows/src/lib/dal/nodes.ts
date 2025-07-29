import {CreateNode, CreateTransactionsToNodesRelation, nodesTable, transactionsToNodesTable} from "@/lib/db/schema";
import {db} from "@/lib/db";

export async function insert(nodes: CreateNode[], transactionId?: number) {
    return db.transaction(async (tx) => {
        const insertedNodes = await tx
          .insert(nodesTable)
          .values(nodes)
          .returning({ id: nodesTable.id, address: nodesTable.address });

        if (transactionId && insertedNodes.length > 0) {
            const relations: CreateTransactionsToNodesRelation[] = insertedNodes.map(node => ({
                transactionId: transactionId,
                nodeId: node.id
            }));

            await tx
              .insert(transactionsToNodesTable)
              .values(relations);
        }

        return insertedNodes;
    });
}

