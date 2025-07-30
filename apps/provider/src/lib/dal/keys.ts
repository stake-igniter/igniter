import { db } from "@/db";
import {CreateKey, Key, keysTable, KeyState} from "@/db/schema";
import {PgTransaction} from 'drizzle-orm/pg-core';
import {and, eq, count, inArray, sql, ExtractTablesWithRelations} from "drizzle-orm";
import {NodePgQueryResultHKT} from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";

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

/**
 * Updates keys that match the given addresses and delegator identity
 * from 'Delivered' state to 'Available' state and clears delivery information.
 *
 * @param addresses - Array of addresses to update
 * @param delegatorIdentity - The delegator identity who currently has the keys
 * @returns The number of keys that were updated
 */
export async function markAvailable(addresses: string[], delegatorIdentity: string) {
  return db.update(keysTable)
    .set({
      state: KeyState.Available,
      deliveredAt: null,
      deliveredTo: null,
      ownerAddress: null,
    })
    .where(
      and(
        inArray(keysTable.address, addresses),
        eq(keysTable.deliveredTo, delegatorIdentity),
        eq(keysTable.state, KeyState.Delivered)
      )
    )
    .returning({ address: keysTable.address });
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

// TODO: when we manage the state of the keys we must add a state filter to only query the staked keys
export async function listStakedAddresses(){
  return await db.query.keysTable.findMany({
    columns: {
      address: true
    },
  }).then(keys => keys.map(key => key.address));
}


/**
 * Atomically lock up to `count` Available keys for update,
 * skipping those already locked by concurrent txns.
 */
export async function lockAvailableKeys(
    tx: PgTransaction<NodePgQueryResultHKT, typeof schema>,
    addressGroupId: number,
    count: number
): Promise<Key[]> {
  return tx
      .select()
      .from(keysTable)
      .where(
          and(
              eq(keysTable.addressGroupId, addressGroupId),
              eq(keysTable.state, KeyState.Available),
          )
      )
      .limit(count)
      .for('update', { skipLocked: true });
}

/**
 * UPDATE those rows to Delivered and set deliveredTo/At
 * Returns the updated rows.
 */
export async function markKeysDelivered(
    tx: PgTransaction<NodePgQueryResultHKT>,
    keyIds: number[],
    deliveredTo: string,
    ownerAddress: string,
): Promise<Key[]> {
  if (!keyIds.length) return [];
  return tx
      .update(keysTable)
      .set({
        state: KeyState.Delivered,
        deliveredTo,
        deliveredAt: new Date(),
        ownerAddress,
      })
      .where(inArray(keysTable.id, keyIds))
      .returning();
}

export async function markStaked(addresses: string[], delegatorIdentity: string) {
  return db.update(keysTable)
      .set({
        state: KeyState.Staked,
      })
      .where(
          and(
              inArray(keysTable.address, addresses),
              eq(keysTable.deliveredTo, delegatorIdentity),
              eq(keysTable.state, KeyState.Delivered)
          )
      )
      .returning({ address: keysTable.address });
}

/**
 * INSERT new keys, returning the full rows
 */
export async function insertNewKeys(
    tx: PgTransaction<NodePgQueryResultHKT>,
    newKeys: CreateKey[]
): Promise<Key[]> {
  if (!newKeys.length) return [];
  const inserted = await tx
      .insert(keysTable)
      .values(newKeys)
      .returning();
  if (inserted.length !== newKeys.length) {
    throw new Error("Failed to insert all new keys");
  }
  return inserted;
}
