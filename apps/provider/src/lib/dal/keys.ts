import { db } from "@/db";
import { CreateKey, keysTable } from "@/db/schema";

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

export async function listPrivateKeysByAddressGroup(addressGroupId: number) {
  return db.query.keysTable.findMany({
    columns: {
      privateKey: true
    },
    where: (keysTable, { eq }) => eq(keysTable.addressGroupId, addressGroupId),
  })
}
