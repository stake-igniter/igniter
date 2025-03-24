import { db } from "@/db";
import { KeyManagementStrategy, keyManagementStrategyTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createKeyManagementStrategy(
  keyManagementStrategy: KeyManagementStrategy
) {
  return await db
    .insert(keyManagementStrategyTable)
    .values(keyManagementStrategy)
    .returning()
    .then((res) => res[0]);
}

export async function getKeyManagementStrategy(id: number) {
  const strategy = await db.query.keyManagementStrategyTable.findFirst({
    where: eq(keyManagementStrategyTable.id, id),
  });

  if (!strategy) {
    throw new Error("Key Management Strategy not found");
  }

  return strategy;
}

export async function getActiveKeyManagementStrategy() {
  const strategy = await db.query.keyManagementStrategyTable.findFirst({
    where: eq(keyManagementStrategyTable.disabled, false),
    orderBy: (strategy, { asc }) => [asc(strategy.weight)],
  });

  if (!strategy) {
    throw new Error("No active Key Management Strategy found");
  }

  return strategy;
}
