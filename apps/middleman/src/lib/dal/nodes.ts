import "server-only";
import { db } from "@/db";
import { Node, nodesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getNodesByUser() {
  return await db.query.nodesTable.findMany({
    with: {
      provider: true,
    },
  });
}
