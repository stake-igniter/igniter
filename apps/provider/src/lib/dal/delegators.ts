import { db } from "@/db";

export async function getDelegatorByIdentity(identity: string) {
  return db.query.delegatorsTable.findFirst({
    where: (delegators, { and, eq }) =>
      and(
        eq(delegators.identity, identity),
        eq(delegators.enabled, true),
      ),
  });
}
