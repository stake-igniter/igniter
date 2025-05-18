"use server";

import type {CreateService, Service} from "@/db/schema";
import {insert, list, remove, update} from "@/lib/dal/services";
import {getCurrentUserIdentity} from "@/lib/utils/actions";

export async function CreateService(service: CreateService) {
  const userIdentity = await getCurrentUserIdentity();
  return insert({
    ...service,
    createdBy: userIdentity,
    updatedBy: userIdentity,
  });
}

export async function UpdateService(id: string, service: Pick<Service, 'revSharePercentage' | 'endpoints'>) {
  const userIdentity = await getCurrentUserIdentity();
  return update(id, {
    ...service,
    updatedBy: userIdentity,
  });
}

export async function ListServices() {
  return list();
}

export async function DeleteService(id: string) {
  return remove(id);
}
