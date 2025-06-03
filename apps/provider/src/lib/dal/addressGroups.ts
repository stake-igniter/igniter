import { db } from "@/db";
import {
  AddressGroup,
  addressGroupTable,
  AddressGroupWithDetails,
  CreateAddressGroup,
  AddressGroupService, addressGroupServicesTable
} from "@/db/schema";
import {eq, sql, and} from "drizzle-orm";

export async function insert(
  addressGroup: CreateAddressGroup,
  services: Omit<AddressGroupService, "addressGroupId">[]
): Promise<AddressGroup> {
  return db.transaction(async (tx) => {
    const [insertedGroup] = await tx
      .insert(addressGroupTable)
      .values(addressGroup)
      .returning();

    if (!insertedGroup) {
      throw new Error("Failed to insert address group");
    }

    if (services.length > 0) {
      const toInsert = services.map((s) => ({
        addressGroupId: insertedGroup.id,
        serviceId: s.serviceId,
        addSupplierShare: s.addSupplierShare ?? false,
        supplierShare: s.supplierShare ?? null,
        revShare: s.revShare ?? [], // revShare is JSON‐typed, defaults to [] if undefined
      }));

      await tx.insert(addressGroupServicesTable).values(toInsert);
    }

    return insertedGroup;
  });
}

export async function update(
  id: number,
  addressGroupUpdates: Partial<AddressGroup>,
  services: Omit<AddressGroupService, "addressGroupId">[]
): Promise<AddressGroup> {
  return db.transaction(async (tx) => {
    const [updatedGroup] = await tx
      .update(addressGroupTable)
      .set(addressGroupUpdates)
      .where(sql`${addressGroupTable.id} = ${id}`)
      .returning();

    if (!updatedGroup) {
      throw new Error("Failed to update the address group");
    }

    await tx
      .delete(addressGroupServicesTable)
      .where(sql`${addressGroupServicesTable.addressGroupId} = ${id}`);

    if (services.length > 0) {
      const toInsert = services.map((s) => ({
        addressGroupId: id,
        serviceId: s.serviceId,
        addSupplierShare: s.addSupplierShare ?? false,
        supplierShare: s.supplierShare ?? null,
        revShare: s.revShare ?? [],
      }));
      await tx.insert(addressGroupServicesTable).values(toInsert);
    }

    return updatedGroup;
  });
}

export async function remove(id: number): Promise<AddressGroup> {
  return db.transaction(async (tx) => {
    await tx
      .delete(addressGroupServicesTable)
      .where(sql`${addressGroupServicesTable.addressGroupId} = ${id}`);

    const [deletedGroup] = await tx
      .delete(addressGroupTable)
      .where(sql`${addressGroupTable.id} = ${id}`)
      .returning();

    if (!deletedGroup) {
      throw new Error("Failed to delete address group");
    }

    return deletedGroup;
  });
}

export async function list(
  region: string = "",
  priv?: boolean
): Promise<AddressGroupWithDetails[]> {
  const filters = [];

  if (region) {
    filters.push(eq(addressGroupTable.region, region));
  }
  if (priv !== undefined) {
    filters.push(eq(addressGroupTable.private, priv));
  }

  return db.query.addressGroupTable.findMany({
    ...(filters.length > 0 && { where: and(...filters) }),
    columns: {
      id: true,
      name: true,
      region: true,
      domain: true,
      clients: true,
      private: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true,
    },
    with: {
      addressGroupServices: {
        with: {
          service: true,
        },
        limit: 8,
      },
    },
    orderBy: addressGroupTable.name,
  });
}

export async function simpleList() {
  return db.query.addressGroupTable.findMany()
}
