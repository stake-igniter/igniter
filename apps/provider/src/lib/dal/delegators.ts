import { db } from "@/db";
import {Delegator, delegatorsTable} from "@/db/schema";
import {sql} from "drizzle-orm";

export async function getDelegatorByIdentity(identity: string) {
  return db.query.delegatorsTable.findFirst({
    where: (delegators, { and, eq }) =>
      and(
        eq(delegators.identity, identity),
        eq(delegators.enabled, true),
      ),
  });
}


export async function disableAll() {
  return db.transaction(async (tx) => {
    const updatedDelegators = await tx
      .update(delegatorsTable)
      .set({
        enabled: false,
      })
      .returning();

    if (!updatedDelegators.length) {
      throw new Error("Failed to deselect all or some delegators");
    }

    return updatedDelegators;
  });
}

export async function enableAll() {
  return db.transaction(async (tx) => {
    const updatedDelegators = await tx
      .update(delegatorsTable)
      .set({
        enabled: true,
      })
      .returning();

    if (!updatedDelegators.length) {
      throw new Error("Failed to deselect all or some delegators");
    }

    return updatedDelegators;
  })
}

export async function list() {
  return db.query.delegatorsTable.findMany();
}


export async function update(
  identity: string,
  delegatorUpdates: Partial<Delegator>,
): Promise<Delegator> {
  const [updatedDelegator] = await db
    .update(delegatorsTable)
    .set(delegatorUpdates)
    .where(sql`${delegatorsTable.identity} = ${identity}`)
    .returning();

  if (!updatedDelegator) {
    throw new Error("Failed to update the delegator");
  }

  return updatedDelegator;
}
