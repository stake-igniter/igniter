"use server";

import {ApplicationSettings, ChainId} from "@/db/schema";
import {
  getApplicationSettings as fetchApplicationSettings,
  insertApplicationSettings,
  updateApplicationSettings,
} from "@/lib/dal/applicationSettings";
import { redirect } from "next/navigation";
import { z } from "zod";
import {getCurrentUserIdentity} from "@/lib/utils/actions";

const UpdateSettingsSchema = z.object({
  name: z.string().optional(),
  appIdentity: z.string().min(1, "App identity is required").optional(),
  supportEmail: z.string().email().optional(),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required").optional(),
  minimumStake: z.number().optional(),
});

const CreateSettingsSchema = z.object({
  minimumStake: z.number().min(1),
  rpcUrl: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  appIdentity: z.string().min(1, "App identity is required"),
  chainId: z.nativeEnum(ChainId),
})

export async function GetApplicationSettings() {
  return await fetchApplicationSettings();
}

function ValidateWithSchema(schema: z.ZodSchema<any>, data: Partial<ApplicationSettings>) {
  const validation = schema.safeParse(data);

  if (!validation.success) {
    throw new Error(validation.error.message);
  }

  return validation;
}

export async function UpsertApplicationSettings(
  values: Partial<ApplicationSettings>,
  isUpdate: boolean
) {
  const userIdentity = await getCurrentUserIdentity();
  const validatedFields = ValidateWithSchema(isUpdate ? UpdateSettingsSchema : CreateSettingsSchema, values);
  if (isUpdate) {
    await updateApplicationSettings({
      ...validatedFields.data,
      updatedBy: userIdentity,
    });
  } else {
    await insertApplicationSettings({
      ...validatedFields.data,
      createdBy: userIdentity,
      updatedBy: userIdentity,
    });
  }
}

export async function completeSetup() {
  await updateApplicationSettings({ isBootstrapped: true });
  return redirect("/admin");
}
