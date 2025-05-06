"use server";

import { updateApplicationSettings } from "@/lib/dal/applicationSettings";
import { redirect } from "next/navigation";
import { z } from "zod";

interface StakeSettings {
  chains: string[];
  domain: string;
  defaultChains: string[];
  identity: string;
  pattern: string;
}

export async function upsertStakeSettings(values: StakeSettings) {
  // TODO: Implement according to the new address group settings.
}

export async function completeSetup() {
  await updateApplicationSettings({ isBootstrapped: true });
  return redirect("/admin");
}
