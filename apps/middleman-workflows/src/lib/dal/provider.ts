import { db } from "../db";
import {Provider, providersTable} from "../db/schema";
import { eq} from "drizzle-orm";

export async function list() {
  return db.query.providersTable.findMany({
    where: (providers, { eq }) => {
      return eq(providers.enabled, true) && eq(providers.visible, true);
    },
  });
}

export async function updateProvider(
  providerId: number,
  provider: Partial<Provider>
) {
  return db
    .update(providersTable)
    .set(provider)
    .where(eq(providersTable.id, providerId));
}

export async function updateProviders(providers: Provider[]) {
  const updates = providers.map(({ id, ...rest }) => {
    return updateProvider(id, rest);
  });
  await Promise.all(updates);
}

export async function getProvider(providerId: string) {
  return db.query.providersTable.findFirst({
    where: eq(providersTable.identity, providerId),
  });
}
