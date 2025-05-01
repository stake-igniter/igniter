import { db } from "@/db";
import {AddressGroup, addressGroupTable, CreateAddressGroup} from "@/db/schema";
import {eq, sql} from "drizzle-orm";

export async function getAddressGroups(): Promise<AddressGroup[]> {
  return db.query.addressGroupTable.findMany({
    with: {
      services: true,
    }
  });
}

export async function getAddressGroupsByIdentity(identity: string) {
  const addressGroup = await db.query.addressGroupTable.findFirst({
    where: eq(addressGroupTable.name, identity),
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

export async function insert(
  addressGroup: CreateAddressGroup
): Promise<AddressGroup> {
  const [insertedGroup] = await db
    .insert(addressGroupTable)
    .values(addressGroup)
    .returning();

  if (!insertedGroup) {
    throw new Error("Failed to insert address group");
  }

  return insertedGroup;
}

export async function list(groupIds: string[] = []): Promise<AddressGroup[]> {
  if (groupIds.length > 0) {
    return db
      .select()
      .from(addressGroupTable)
      .where(sql`${addressGroupTable.id} IN ${groupIds}`)
      .orderBy(addressGroupTable.name);
  }

  return db.select().from(addressGroupTable).orderBy(addressGroupTable.name);
}

export async function remove(id: number): Promise<AddressGroup> {
  const [deletedGroup] = await db
    .delete(addressGroupTable)
    .where(sql`${addressGroupTable.id} = ${id}`)
    .returning();

  if (!deletedGroup) {
    throw new Error("Failed to delete address group");
  }

  return deletedGroup;
}

export async function update(
  id: number,
  addressGroupUpdates: Partial<AddressGroup>,
): Promise<AddressGroup> {
  const [updatedGroup] = await db
    .update(addressGroupTable)
    .set(addressGroupUpdates)
    .where(sql`${addressGroupTable.id} = ${id}`)
    .returning();

  if (!updatedGroup) {
    throw new Error("Failed to update the address group");
  }

  return updatedGroup;
}
