import "server-only";
import { db } from "@/db";
import { Provider, providersTable } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function upsertProviders(
  providers: Omit<Provider, "id" | "createdAt" | "updatedAt">[]
) {
  return await db
    .insert(providersTable)
    .values(providers)
    .onConflictDoUpdate({
      target: providersTable.publicKey,
      set: {
        enabled: sql`excluded.enabled`,
      },
    })
    .returning();
}
