import { db } from "@/db";
import {
  keysTable,
  AddressGroup,
  addressGroupTable,
  AddressGroupWithDetails,
  CreateAddressGroup
} from "@/db/schema";
import {eq, sql, and} from "drizzle-orm";

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

export async function list(region: string = '', priv?: boolean): Promise<AddressGroupWithDetails[]> {
  try {
    let baseQuery = db
      .select({
        id: addressGroupTable.id,
        name: addressGroupTable.name,
        region: addressGroupTable.region,
        domain: addressGroupTable.domain,
        clients: addressGroupTable.clients,
        services: addressGroupTable.services,
        private: addressGroupTable.private,
        createdAt: addressGroupTable.createdAt,
        updatedAt: addressGroupTable.updatedAt,
        createdBy: addressGroupTable.createdBy,
        updatedBy: addressGroupTable.updatedBy,
        keysCount: sql<number>`COUNT(DISTINCT ${keysTable.id})::int`.as('keys_count')
      })
      .from(addressGroupTable)
      .leftJoin(keysTable, eq(addressGroupTable.id, keysTable.addressGroupId))
      .groupBy(addressGroupTable.id);

    const conditions = [];

    if (region) {
      conditions.push(eq(addressGroupTable.region, region));
    }

    if (priv !== undefined) {
      conditions.push(eq(addressGroupTable.private, priv));
    }

    const query = conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    return await query.orderBy(addressGroupTable.name);
  } catch (error) {
    console.error("Error listing address groups:", error);
    throw new Error("Failed to retrieve address groups");
  }
}

export async function simpleList() {
  return db.query.addressGroupTable.findMany()
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
