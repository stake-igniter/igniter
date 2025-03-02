'use server';

import {ApplicationSettings} from "@/db/schema";

export async function getApplicationSettings(): Promise<ApplicationSettings> {
  return {
    id: 1,
    configuredChain: "mainnet",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

