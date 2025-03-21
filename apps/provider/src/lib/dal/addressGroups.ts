import { db } from "@/db";
import {
  AddressGroup,
  Chain,
  addressGroupTable,
  chainsToAddressGroup,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createAddressGroup(
  addressGroup: AddressGroup,
  chainIds?: number[]
) {
  const insertedGroup = await db
    .insert(addressGroupTable)
    .values(addressGroup)
    .returning()
    .then((res) => res[0]);

  if (insertedGroup && chainIds) {
    await addChainsToAddressGroup(insertedGroup.id, chainIds);
  }

  return insertedGroup;
}

export async function getAddressGroups(): Promise<AddressGroup[]> {
  return db.query.addressGroupTable.findMany();
}

export async function addChainsToAddressGroup(
  addressGroupId: number,
  chainIds: number[]
) {
  return db
    .insert(chainsToAddressGroup)
    .values(
      chainIds.map((chainId) => ({
        addressGroupId,
        chainId,
      }))
    )
    .returning();
}

export async function getAddressGroupsByIdentity(identity: string) {
  const addressGroup = await db.query.addressGroupTable.findFirst({
    where: eq(addressGroupTable.identity, identity),
    with: {
      chainsToAddressGroups: {
        columns: {
          chainId: true,
        },
      },
    },
  });

  if (!addressGroup) {
    throw new Error("Address Group not found");
  }

  return addressGroup;
}
