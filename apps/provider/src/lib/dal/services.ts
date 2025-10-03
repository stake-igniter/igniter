import type {
  InsertService,
  Service,
} from '@igniter/db/provider/schema'
import { getDb, getDbClient } from '@/db'
import {
  addressGroupServicesTable,
  servicesTable,
} from '@igniter/db/provider/schema'
import { sql } from 'drizzle-orm'

export async function insert(
  service: InsertService,
): Promise<Service> {
  const [insertedService] = await getDb()
    .insert(servicesTable)
    .values(service)
    .returning()

  if (!insertedService) {
    throw new Error('Failed to insert application settings')
  }

  return insertedService
}

export async function list(serviceIds: string[] = []): Promise<Service[]> {
  if (serviceIds.length > 0) {
    return getDb()
      .select()
      .from(servicesTable)
      .where(sql`${servicesTable.serviceId} IN ${serviceIds}`)
      .orderBy(servicesTable.name)
  }

  return getDb().select().from(servicesTable).orderBy(servicesTable.name)
}

export async function remove(sId: string): Promise<Service> {
  const dbClient = getDbClient()
  return dbClient.db.transaction(async (tx) => {
    await tx.delete(addressGroupServicesTable).where(sql`${addressGroupServicesTable.serviceId} = ${sId}`)

    const [deletedService] = await tx
       .delete(servicesTable)
       .where(sql`${servicesTable.serviceId} = ${sId}`)
       .returning()

     if (!deletedService) {
       throw new Error('Failed to delete service')
     }

     return deletedService
  })
}

export async function update(
  serviceId: string,
  serviceUpdates: Pick<Service, 'revSharePercentage' | 'endpoints' | 'updatedBy'>,
): Promise<Service> {

  const [updatedService] = await getDb()
    .update(servicesTable)
    .set(serviceUpdates)
    .where(sql`${servicesTable.serviceId} = ${serviceId}`)
    .returning()

  if (!updatedService) {
    throw new Error('Failed to update the service')
  }

  return updatedService
}

export async function getDistinctRevAddresses(): Promise<Array<string>> {
  const distinctAddresses = await getDb()
    .select({
      address: sql<string>`DISTINCT (json_array_elements(${addressGroupServicesTable.revShare})->>'address')`,
    })
    .from(addressGroupServicesTable)
    .where(sql`${addressGroupServicesTable.revShare}::text != '[]'`)

  return distinctAddresses.map(a => a.address)
}
