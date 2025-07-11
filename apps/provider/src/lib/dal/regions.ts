import { sql, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { regionsTable, type Region, type CreateRegion } from "@/db/schema";

export async function list(): Promise<Region[]> {
    return db.query.regionsTable.findMany({
        orderBy: regionsTable.displayName,
    });
}

export async function insert(
    region: CreateRegion
): Promise<Region> {
    const [insertedRegion] = await db
        .insert(regionsTable)
        .values(region)
        .returning();

    if (!insertedRegion) {
        throw new Error("Failed to insert region");
    }

    return insertedRegion;
}

export async function update(
    id: number,
    regionUpdates: Partial<Region>
): Promise<Region> {
    const [updatedRegion] = await db
        .update(regionsTable)
        .set(regionUpdates)
        .where(eq(regionsTable.id, id))
        .returning();

    if (!updatedRegion) {
        throw new Error("Failed to update the region");
    }

    return updatedRegion;
}

export async function remove(id: number): Promise<Region> {
    const [deletedRegion] = await db
        .delete(regionsTable)
        .where(eq(regionsTable.id, id))
        .returning();

    if (!deletedRegion) {
        throw new Error("Failed to delete the region");
    }

    return deletedRegion;
}
