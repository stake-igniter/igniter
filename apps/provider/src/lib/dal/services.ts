import {db} from "@/db";
import {CreateService, Service, servicesTable} from "@/db/schema";
import {sql} from "drizzle-orm";

export async function insert(
  service: CreateService
): Promise<Service> {
  const [insertedService] = await db
    .insert(servicesTable)
    .values(service)
    .returning();

  if (!insertedService) {
    throw new Error("Failed to insert application settings");
  }

  return insertedService;
}

export async function list(serviceIds: string[] = []): Promise<Service[]> {
  if (serviceIds.length > 0) {
    return db
      .select()
      .from(servicesTable)
      .where(sql`${servicesTable.serviceId} IN ${serviceIds}`);
  }

  return db.select().from(servicesTable);
}

export async function remove(sId: string): Promise<Service> {
  const [deletedService] = await db
    .delete(servicesTable)
    .where(sql`${servicesTable.serviceId} = ${sId}`)
    .returning();

  if (!deletedService) {
    throw new Error("Failed to delete service");
  }

  return deletedService;
}
