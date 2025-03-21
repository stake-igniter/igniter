// create chains method

import { Chain, chainsTable } from "@/db/schema";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";

export async function insertChains(chains: Chain[]): Promise<Chain[]> {
  const insertedChains = await db
    .insert(chainsTable)
    .values(chains)
    .returning();

  if (!insertedChains) {
    throw new Error("Failed to insert chains");
  }

  return insertedChains;
}

export async function getChains(): Promise<Chain[]> {
  return await db.query.chainsTable.findMany();
}

export async function upsertChain(chain: Chain): Promise<Chain[]> {
  return await db
    .insert(chainsTable)
    .values(chain)
    .onConflictDoUpdate({
      target: chainsTable.id,
      set: { ...chain },
    })
    .returning();
}

export async function deleteChains(chainIds: number[]): Promise<void> {
  await db.delete(chainsTable).where(inArray(chainsTable.id, chainIds));
}
