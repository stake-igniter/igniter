import { db } from "../db";
import { Provider, providersTable } from "../db/schema";
import { eq, inArray, SQL, sql } from "drizzle-orm";

export async function list() {
  return db.query.providersTable.findMany({
    where: (providers, { eq }) => {
      return eq(providers.enabled, true) && eq(providers.visible, true);
    },
  });
}

export async function updatedProvidersStatus(providers: Provider[]) {
  const sqlChunks: SQL[] = [];
  const ids: number[] = [];

  if (providers.length === 0) {
    return;
  }

  sqlChunks.push(sql`(case`);
  for (const provider of providers) {
    sqlChunks.push(
      sql`when ${providersTable.id} = ${provider.id} then ${provider.status}::${sql.raw("provider_status")}`
    );
    ids.push(provider.id);
  }
  sqlChunks.push(sql`end)`);
  const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

  await db
    .update(providersTable)
    .set({ status: finalSql })
    .where(inArray(providersTable.id, ids));
}
