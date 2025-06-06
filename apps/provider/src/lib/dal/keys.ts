import { db } from "@/db";
import {CreateKey, keysTable, KeyState} from "@/db/schema";
import {and, eq, count} from "drizzle-orm";

/**
 * Inserts multiple keys into the database using a transaction.
 * If any insertion fails, the entire transaction is rolled back.
 * @param keys - Array of keys to insert
 * @returns The inserted keys
 */
export async function insertMany(keys: CreateKey[]): Promise<CreateKey[]> {
  const existingKey = await db.query.keysTable.findFirst({
    where: ((keysTable, {inArray}) => inArray(keysTable.address, keys.map(k => k.address)))
  })

  if (existingKey) {
    throw new Error("There are keys that already exists")
  }

  return db.transaction(async (tx) => {
    const insertedKeys = await tx
      .insert(keysTable)
      .values(keys)
      .returning();

    if (!insertedKeys.length || insertedKeys.length !== keys.length) {
      throw new Error("Failed to insert all keys");
    }

    return insertedKeys;
  });
}

export async function listKeysWithPk() {
  return db.query.keysTable.findMany({
    columns: {
      privateKey: false,
    },
    with: {
      addressGroup: true,
      delegator: true
    }
  })
}

export async function countPrivateKeysByAddressGroup(addressGroupId: number, state?: KeyState) {
  const filters = [];

  if (addressGroupId) {
    filters.push(eq(keysTable.addressGroupId, addressGroupId));
  }

  if (state) {
    filters.push(eq(keysTable.state, state));
  }

  const [result] = await db.select({
    count: count()
  })
    .from(keysTable)
    .where(filters.length > 0 ? and(...filters) : undefined);

  return Number(result?.count || 0);
}


export async function listPrivateKeysByAddressGroup(addressGroupId: number, state?: KeyState) {
  const filters = [];

  if (addressGroupId) {
    filters.push(eq(keysTable.addressGroupId, addressGroupId));
  }

  if (state) {
    filters.push(eq(keysTable.state, state));
  }

  return db.query.keysTable.findMany({
    ...(filters.length > 0 && { where: and(...filters) }),
    columns: {
      privateKey: true
    },
  });
}
