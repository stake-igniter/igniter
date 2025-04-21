"use server";

import {ApplicationSettings, ChainId} from "@/db/schema";
import {
  getApplicationSettings as fetchApplicationSettings,
  insertApplicationSettings,
  updateApplicationSettings,
} from "@/lib/dal/applicationSettings";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const updateSettingsSchema = z.object({
  chainId: z.nativeEnum(ChainId),
  name: z.string().min(1, "Name is required"),
  supportEmail: z.string().email().optional(),
  ownerEmail: z.string().email(),
  fee: z.coerce
    .number()
    .min(1, "Middleman fee must be greater than 0")
    .max(100),
  minimumStake: z.number(),
  privacyPolicy: z.string().optional(),
});

export async function getApplicationSettings() {
  return await fetchApplicationSettings();
}

export async function upsertSettings(
  values: Partial<ApplicationSettings>,
  isUpdate: boolean
) {
  const validatedFields = updateSettingsSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid form data");
  }

  if (isUpdate) {
    await updateApplicationSettings(values);
  } else {
    await insertApplicationSettings(values as ApplicationSettings);
  }

  revalidatePath("/admin/setup");
}

export async function completeSetup() {
  await updateApplicationSettings({ isBootstrapped: true });
  return redirect("/admin");
}
