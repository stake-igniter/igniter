import "server-only";
import { db } from "@/db";
import { Provider, providersTable } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function upsertProviders(
  providers: Pick<Provider, "name" | "identity" | "url" | "publicKey" | "enabled" | "visible" | "createdBy" | "updatedBy">[],
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

export async function list() : Promise<Provider[]> {
  const providers = await db.query.providersTable.findMany({
    where: (providers, {eq}) => {
      return eq(providers.visible, true);
    }
  })

  if (!providers) {
    return [];
  }

  return providers;
}

export async function getByPublicKey(publicKey: string) {
  return db.query.providersTable.findFirst({
    where: (providers, {eq, and}) => {
      return and(
        eq(providers.publicKey, publicKey),
        eq(providers.enabled, true),
        eq(providers.visible, true)
      );
    },
  });
}

