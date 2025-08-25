"use server";

import {disableAll, enableAll, list, update} from "@/lib/dal/delegators";
import {Delegator, delegatorsTable} from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {getCurrentUserIdentity} from "@/lib/utils/actions";
import { getApplicationSettings } from '@/lib/dal/applicationSettings'

export async function ListDelegators() {
  return list();
}

export async function UpdateDelegator(identity: string, updateValues: Pick<Delegator, 'enabled'>) {
  const userIdentity = await getCurrentUserIdentity();
  return update(identity, {
    ...updateValues,
    updatedBy: userIdentity,
  });
}

export async function UpdateDelegatorsFromSource() {
  const [userIdentity, appSettings] = await Promise.all([
    getCurrentUserIdentity(),
    getApplicationSettings(),
  ]);

  const delegatorsCdnUrl = process.env.DELEGATORS_CDN_URL!.replace(
    "{chainId}",
    appSettings.chainId,
  );

  if (!delegatorsCdnUrl) {
    throw new Error("DELEGATORS_CDN_URL environment variable is not defined");
  }

  console.log(`[Delegators] Starting update from ${delegatorsCdnUrl}`);

  try {
    const response = await fetch(delegatorsCdnUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch delegators: ${response.statusText}`);
    }

    type CdnDelegator = {
      name: string;
      identity: string;
      identityHistory: string[];
    };

    const delegatorsFromCdn = (await response.json()) as CdnDelegator[];
    console.log(
      `[Delegators] Fetched ${delegatorsFromCdn.length} delegators from CDN`,
    );

    const currentDelegators = await list();
    const currentDelegatorsMap = new Map(
      currentDelegators.map((d) => [d.identity, d]),
    );

    const allCdnIdentities = new Set<string>();
    for (const d of delegatorsFromCdn) {
      allCdnIdentities.add(d.identity);
      d.identityHistory.forEach((h) => allCdnIdentities.add(h));
    }

    const { inserted, updated, disabled } = await db.transaction(
      async (tx) => {
        let inserted = 0;
        let updated = 0;
        let disabled = 0;

        for (const cdnDelegator of delegatorsFromCdn) {
          const possibleIds = [
            cdnDelegator.identity,
            ...cdnDelegator.identityHistory,
          ];

          const matchingCurrent =
            possibleIds.map((id) => currentDelegatorsMap.get(id)).find(Boolean) ??
            null;

          if (matchingCurrent) {
            const shouldUpdateIdentity =
              matchingCurrent.identity !== cdnDelegator.identity;
            const shouldUpdateName =
              matchingCurrent.name !== cdnDelegator.name;

            if (shouldUpdateIdentity || shouldUpdateName) {
              await tx
                .update(delegatorsTable)
                .set({
                  identity: cdnDelegator.identity,
                  name: cdnDelegator.name,
                  updatedBy: userIdentity,
                })
                .where(eq(delegatorsTable.id, matchingCurrent.id));
              updated += 1;
            }
          } else {
            await tx.insert(delegatorsTable).values({
              name: cdnDelegator.name,
              identity: cdnDelegator.identity,
              createdBy: userIdentity,
              updatedBy: userIdentity,
              enabled: false,
            });
            inserted += 1;
          }
        }

        for (const delegator of currentDelegators) {
          if (!allCdnIdentities.has(delegator.identity) && delegator.enabled) {
            await tx
              .update(delegatorsTable)
              .set({
                enabled: false,
                updatedAt: new Date(),
                updatedBy: userIdentity,
              })
              .where(eq(delegatorsTable.identity, delegator.identity));
            disabled += 1;
          }
        }

        return { inserted, updated, disabled };
      },
    );

    console.log(
      `[Delegators] Done. Inserted: ${inserted}, Updated: ${updated}, Disabled: ${disabled}`,
    );

    console.log(
      `[Delegators] Done. Inserted: ${inserted}, Updated: ${updated}, Disabled: ${disabled}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating delegators:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function DisableAllDelegators() {
  const userIdentity = await getCurrentUserIdentity();
  return disableAll(userIdentity);
}

export async function EnableAllDelegators() {
  const userIdentity = await getCurrentUserIdentity();
  return enableAll(userIdentity);
}
