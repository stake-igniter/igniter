"use server";

import type {CreateService} from "@/db/schema";
import {insert, list, remove} from "@/lib/dal/services";

export async function CreateService(service: CreateService) {
  return insert(service);
}

export async function ListServices() {
  return list();
}

export async function DeleteService(id: string) {
  return remove(id);
}
