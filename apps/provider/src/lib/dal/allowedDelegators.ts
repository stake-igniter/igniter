import { db } from "@/db";

export async function getDelegatorByIdentity(identity: string) {
  return db.query.allowedDelegatorsTable.findFirst({
    where: (allowedDelegators, { and, eq }) =>
      and(
        eq(allowedDelegators.identity, identity),
        eq(allowedDelegators.enabled, true),
      ),
  });
}
