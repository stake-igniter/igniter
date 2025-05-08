import { db } from "@/db";
import { CreateKey, keysTable } from "@/db/schema";

/**
 * Inserts multiple keys into the database using a transaction.
 * If any insertion fails, the entire transaction is rolled back.
 * @param keys - Array of keys to insert
 * @returns The inserted keys
 */
export async function insertMany(keys: CreateKey[]): Promise<CreateKey[]> {
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
