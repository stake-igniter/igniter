"use server";

import {list, upsertProviders, getByIdentity, update} from "@/lib/dal/providers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {getCurrentUserIdentity} from "@/lib/utils/actions";
import { getApplicationSettings } from '@/actions/ApplicationSettings'
import {providersTable} from "@/db/schema";
import {db} from "@/db";
import {eq} from "drizzle-orm";

export interface Provider {
  id: number;
  name: string;
  identity: string;
  url: string;
}

const updateProvidersSchema = z.object({
  providers: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one provider.",
  }),
});

export async function UpdateProvidersFromSource() {
  const [userIdentity, appSettings] = await Promise.all([
    getCurrentUserIdentity(),
    getApplicationSettings(),
  ]);

  const providersCdnUrl = process.env.PROVIDERS_CDN_URL!.replace(
    "{chainId}",
    appSettings.chainId,
  );

  if (!providersCdnUrl) {
    throw new Error("PROVIDERS_CDN_URL environment variable is not defined");
  }

  console.log(`[Providers] Starting update from ${providersCdnUrl}`);

  try {
    const response = await fetch(providersCdnUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.statusText}`);
    }

    type CdnProvider = {
      name: string;
      identity: string;
      identityHistory: string[];
      url: string;
    };

    const providersFromCdn = (await response.json()) as CdnProvider[];
    console.log(
      `[Providers] Fetched ${providersFromCdn.length} providers from CDN`,
    );

    const currentProviders = await list(true);
    const currentProvidersMap = new Map(
      currentProviders.map((p) => [p.identity, p]),
    );

    const allCdnIdentities = new Set<string>();
    for (const p of providersFromCdn) {
      allCdnIdentities.add(p.identity);
      p.identityHistory.forEach((h) => allCdnIdentities.add(h));
    }

    const { inserted, updated, disabled } = await db.transaction(
      async (tx) => {
        let inserted = 0;
        let updated = 0;
        let disabled = 0;

        for (const cdnProvider of providersFromCdn) {
          const possibleIds = [
            cdnProvider.identity,
            ...cdnProvider.identityHistory,
          ];

          const matchingCurrent =
            possibleIds.map((id) => currentProvidersMap.get(id)).find(Boolean) ??
            null;

          if (matchingCurrent) {
            const shouldUpdateIdentity =
              matchingCurrent.identity !== cdnProvider.identity;
            const shouldUpdateName = matchingCurrent.name !== cdnProvider.name;
            const shouldUpdateUrl = matchingCurrent.url !== cdnProvider.url;

            if (shouldUpdateIdentity || shouldUpdateName || shouldUpdateUrl) {
              await tx
                .update(providersTable)
                .set({
                  identity: cdnProvider.identity,
                  name: cdnProvider.name,
                  url: cdnProvider.url,
                  updatedBy: userIdentity,
                })
                .where(eq(providersTable.id, matchingCurrent.id));
              updated += 1;
            }
          } else {
            await tx.insert(providersTable).values({
              name: cdnProvider.name,
              identity: cdnProvider.identity,
              url: cdnProvider.url,
              enabled: false,
              visible: false,
              createdBy: userIdentity,
              updatedBy: userIdentity,
            });
            inserted += 1;
          }
        }

        for (const provider of currentProviders) {
          if (
            !allCdnIdentities.has(provider.identity) &&
            (provider.enabled || provider.visible)
          ) {
            await tx
              .update(providersTable)
              .set({
                enabled: false,
                visible: false,
                updatedAt: new Date(),
                updatedBy: userIdentity,
              })
              .where(eq(providersTable.identity, provider.identity));
            disabled += 1;
          }
        }

        return { inserted, updated, disabled };
      },
    );
    console.log(
      `[Providers] Done. Inserted: ${inserted}, Updated: ${updated}, Disabled: ${disabled}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating providers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

interface SubmitProvidersValues {
  providers: string[];
}

interface SubmitProvidersResult {
  errors?: Record<string, string[]>;
}

export async function submitProviders(
  values: SubmitProvidersValues,
  providers: Provider[]
): Promise<SubmitProvidersResult | void> {
  const userIdentity = await getCurrentUserIdentity();

  const validatedFields = updateProvidersSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid form data");
  }

  const updatedProviders = providers.map(({ id, ...provider }) => ({
    ...provider,
    enabled: values.providers.includes(provider.identity),
    visible: values.providers.includes(provider.identity),
    createdBy: userIdentity,
    updatedBy: userIdentity,
  }));

  await upsertProviders(updatedProviders);

  revalidatePath("/admin/setup");
}

export async function ListProviders(all?: boolean) {
  return list(all);
}

export async function GetProviderByIdentity(identity: string) {
  return getByIdentity(identity);
}

export async function UpdateVisibility(identity: string, visible: boolean) {
  try {
    const updates = visible
      ? { visible }
      : { visible, enabled: false };

    await update(identity, updates);
  } catch (error) {
    console.log('UpdateVisibility: An error occurred while performing the update operation');
    console.error(error);
  }
}

export async function UpdateEnabled(identity: string, enabled: boolean) {
  try {
    await update(identity, { enabled });
  } catch (error) {
    console.log('UpdateEnabled: An error occurred while performing the update operation');
    console.error(error);
  }
}
