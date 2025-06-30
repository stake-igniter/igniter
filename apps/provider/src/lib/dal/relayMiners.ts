import {RelayMiner, relayMinersTable, CreateRelayMiner} from "@/db/schema";
import {db} from "@/db";
import {sql} from "drizzle-orm";

export async function list(): Promise<RelayMiner[]> {
    return db.query.relayMinersTable.findMany({
        orderBy: relayMinersTable.name,
    });
}

export async function remove(id: number): Promise<RelayMiner> {
    const [deletedMiner] = await db
        .delete(relayMinersTable)
        .where(sql`${relayMinersTable.id} = ${id}`)
        .returning();

    if (!deletedMiner) {
        throw new Error("Failed to delete relay miner");
    }

    return deletedMiner;
}

export async function insert(
    relayMiner: CreateRelayMiner
): Promise<RelayMiner> {
    const [insertedMiner] = await db
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
    const [updatedMiner] = await db
        .update(relayMinersTable)
        .set(relayMinerUpdates)
        .where(sql`${relayMinersTable.id} = ${id}`)
        .returning();

    if (!updatedMiner) {
        throw new Error("Failed to update relay miner");
    }

    return updatedMiner;
}
