import type {RelayMiner, InsertRelayMiner, RelayMinerWithDetails} from "@igniter/db/provider/schema";
import {relayMinersTable} from "@igniter/db/provider/schema";
import {getDb} from "@/db";
import {sql} from "drizzle-orm";

export async function list(): Promise<RelayMinerWithDetails[]> {
    return getDb().query.relayMinersTable.findMany({
        orderBy: relayMinersTable.name,
        with: {
          region: true,
        }
    });
}

export async function remove(id: number): Promise<RelayMiner> {
    const [deletedMiner] = await getDb()
        .delete(relayMinersTable)
        .where(sql`${relayMinersTable.id} = ${id}`)
        .returning();

    if (!deletedMiner) {
        throw new Error("Failed to delete relay miner");
    }

    return deletedMiner;
}

export async function insert(
    relayMiner: InsertRelayMiner
): Promise<RelayMiner> {
    const [insertedMiner] = await getDb()
        .insert(relayMinersTable)
        .values(relayMiner)
        .returning();

    if (!insertedMiner) {
        throw new Error("Failed to insert relay miner");
    }

    return insertedMiner;
}

export async function update(
    id: number,
    relayMinerUpdates: Partial<RelayMiner>
): Promise<RelayMiner> {
    const [updatedMiner] = await getDb()
        .update(relayMinersTable)
        .set(relayMinerUpdates)
        .where(sql`${relayMinersTable.id} = ${id}`)
        .returning();

    if (!updatedMiner) {
        throw new Error("Failed to update relay miner");
    }

    return updatedMiner;
}
