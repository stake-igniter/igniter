import { db } from "@/db";
import { AddressGroup, addressGroupTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createAddressGroup(addressGroup: AddressGroup) {
  const insertedGroup = await db
    .insert(addressGroupTable)
    .values(addressGroup)
    .returning()
    .then((res) => res[0]);

  return insertedGroup;
}

export async function getAddressGroups(): Promise<AddressGroup[]> {
  return db.query.addressGroupTable.findMany({
    with: {
      services: true,
    }
  });
}

export async function getAddressGroupsByIdentity(identity: string) {
  const addressGroup = await db.query.addressGroupTable.findFirst({
    where: eq(addressGroupTable.identity, identity),
  });

  if (!addressGroup) {
    throw new Error("Address Group not found");
  }

  return addressGroup;
}

export async function getAddressGroupsWithAddresses() {
  return db.query.addressGroupTable.findMany({
    with: {
      addresses: true,
    },
  });
}
