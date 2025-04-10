import { eq } from "drizzle-orm";
import { db } from "../db";
import { nodesTable, Node, NewNode } from "../db/schema";

export async function insertNodes(nodes: NewNode[]) {
  return await db
    .insert(nodesTable)
    .values(nodes)
    .returning()
    .then((res) => res[0]);
}

export async function updateNode(nodeId: number, payload: Partial<Node>) {
  return await db
    .update(nodesTable)
    .set(payload)
    .where(eq(nodesTable.id, nodeId))
    .returning()
    .then((res) => res[0]);
}
