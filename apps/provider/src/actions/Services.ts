"use server";

import type {CreateService, Service} from "@/db/schema";
import {insert, list, remove, update} from "@/lib/dal/services";

export async function CreateService(service: CreateService) {
  return insert(service);
}

export async function UpdateService(id: string, service: Pick<Service, 'revSharePercentage' | 'endpoints'>) {
  return update(id, service);
}

export async function ListServices() {
  return list();
}

export async function DeleteService(id: string) {
  return remove(id);
}
