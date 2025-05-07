"use server";

import {disableAll, enableAll, list, update} from "@/lib/dal/delegators";
import {Delegator, delegatorsTable} from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function ListDelegators() {
  return list();
}

export async function UpdateDelegator(identity: string, updateValues: Pick<Delegator, 'enabled'>) {
  return update(identity, updateValues);
}

export async function UpdateDelegatorsFromSource() {
  const delegatorsCdnUrl = process.env.DELEGATORS_CDN_URL;

  if (!delegatorsCdnUrl) {
    throw new Error("DELEGATORS_CDN_URL environment variable is not defined");
  }

  try {
    const response = await fetch(delegatorsCdnUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch delegators: ${response.statusText}`);
    }

    const delegatorsFromCdn = await response.json() as Array<{
      name: string;
      identity: string;
      publicKey: string;
    }>;

    const currentDelegators = await list();

    const currentDelegatorsMap = new Map(
      currentDelegators.map(delegator => [delegator.identity, delegator])
    );

    const cdnIdentities = new Set<string>();

    for (const cdnDelegator of delegatorsFromCdn) {
      cdnIdentities.add(cdnDelegator.identity);

      if (currentDelegatorsMap.has(cdnDelegator.identity)) {
        const currentDelegator = currentDelegatorsMap.get(cdnDelegator.identity)!;

        if (currentDelegator.name === cdnDelegator.name && currentDelegator.publicKey === cdnDelegator.publicKey) {
          continue;
        }

        await db.update(delegatorsTable)
          .set({
            name: cdnDelegator.name,
            publicKey: cdnDelegator.publicKey,
          })
          .where(eq(delegatorsTable.identity, cdnDelegator.identity));
      } else {
        await db.insert(delegatorsTable)
          .values({
            name: cdnDelegator.name,
            identity: cdnDelegator.identity,
            publicKey: cdnDelegator.publicKey,
            enabled: false,
          });
      }
    }

    for (const delegator of currentDelegators) {
      if (!cdnIdentities.has(delegator.identity) && delegator.enabled) {
        await db.update(delegatorsTable)
          .set({
            enabled: false,
            updatedAt: new Date()
          })
          .where(eq(delegatorsTable.identity, delegator.identity));
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating delegators:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export async function DisableAllDelegators() {
  return disableAll();
}

export async function EnableAllDelegators() {
  return enableAll();
}
