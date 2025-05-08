import { db } from "@/db";
import {
  keysTable,
  AddressGroup,
  addressGroupTable,
  AddressGroupWithDetails,
  CreateAddressGroup
} from "@/db/schema";
import {eq, sql} from "drizzle-orm";

export async function getAddressGroups(): Promise<AddressGroup[]> {
  return db.query.addressGroupTable.findMany();
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

export async function list(groupIds: string[] = []): Promise<AddressGroupWithDetails[]> {
  const query = db
    .select({
      id: addressGroupTable.id,
      name: addressGroupTable.name,
      region: addressGroupTable.region,
      domain: addressGroupTable.domain,
      clients: addressGroupTable.clients,
      services: addressGroupTable.services,
      createdAt: addressGroupTable.createdAt,
      updatedAt: addressGroupTable.updatedAt,
      addressCount: sql<number>`COUNT(DISTINCT ${keysTable.id})::int`.as('address_count')
    })
    .from(addressGroupTable)
    .leftJoin(keysTable, eq(addressGroupTable.id, keysTable.addressGroupId))
    .groupBy(addressGroupTable.id);

  return groupIds.length > 0
    ? await query.where(sql`${addressGroupTable.id} = ANY(${groupIds})`)
    : await query.orderBy(addressGroupTable.name);
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
