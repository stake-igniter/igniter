import "server-only";
import { db } from "@/db";
import { Provider, providersTable } from "@/db/schema";
import {and, eq, sql} from "drizzle-orm";

export async function upsertProviders(
  providers: Pick<Provider, "name" | "identity" | "url" | "enabled" | "visible" | "createdBy" | "updatedBy">[],
) {
  return db
    .insert(providersTable)
    .values(providers)
    .onConflictDoUpdate({
      target: providersTable.identity,
      set: {
        enabled: sql`excluded.enabled`,
      },
    })
    .returning();
}

export async function list(all?: boolean) : Promise<Provider[]> {
  const filters = [];

  if (!all) {
    filters.push(eq(providersTable.visible, true));
  }

  const providers = await db.query.providersTable.findMany({
    ...(filters.length > 0 && { where: and(...filters) }),
  });

  if (!providers) {
    return [];
  }

  return providers;
}

export async function getByIdentity(identity: string) {
  return db.query.providersTable.findFirst({
    where: (providers, {eq, and}) => {
      return and(
        eq(providers.identity, identity),
        eq(providers.enabled, true),
        eq(providers.visible, true)
      );
    },
  });
}

export async function update(
  identity: string,
  providerUpdates: Partial<Provider>,
): Promise<Provider> {
  const [updatedProvider] = await db
    .update(providersTable)
    .set(providerUpdates)
    .where(sql`${providersTable.identity} = ${identity}`)
    .returning();

  if (!updatedProvider) {
    throw new Error("Failed to update the provider");
  }

  return updatedProvider;
}
