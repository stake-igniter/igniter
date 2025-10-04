import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import type {
  InsertRegion,
  Region,
} from '@igniter/db/provider/schema'
import { regionsTable } from '@igniter/db/provider/schema'

export async function list(): Promise<Region[]> {
  return getDb().query.regionsTable.findMany({
    orderBy: regionsTable.displayName,
  })
}

export async function insert(
  region: InsertRegion,
): Promise<Region> {
  const [insertedRegion] = await getDb()
    .insert(regionsTable)
    .values(region)
    .returning()

  if (!insertedRegion) {
    throw new Error('Failed to insert region')
  }

  return insertedRegion
}

export async function update(
  id: number,
  regionUpdates: Partial<Region>,
): Promise<Region> {
  const [updatedRegion] = await getDb()
    .update(regionsTable)
    .set(regionUpdates)
    .where(eq(regionsTable.id, id))
    .returning()

  if (!updatedRegion) {
    throw new Error('Failed to update the region')
  }

  return updatedRegion
}

export async function remove(id: number): Promise<Region> {
  const [deletedRegion] = await getDb()
    .delete(regionsTable)
    .where(eq(regionsTable.id, id))
    .returning()

  if (!deletedRegion) {
    throw new Error('Failed to delete the region')
  }

  return deletedRegion
}
