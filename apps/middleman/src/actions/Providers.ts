"use server";

import {list, upsertProviders} from "@/lib/dal/providers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface Provider {
  id: number;
  name: string;
  publicKey: string;
  url: string;
}

const updateProvidersSchema = z.object({
  providers: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one provider.",
  }),
});

export async function loadProvidersFromCdn(): Promise<Provider[]> {
  const url = process.env.PROVIDERS_CDN_URL;

  if (!url) {
    throw new Error("PROVIDERS_CDN_URL is not defined");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch providers from CDN: ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading providers from CDN:", error);
    return [];
  }
}

interface SubmitProvidersValues {
  providers: string[];
}

interface SubmitProvidersResult {
  errors?: Record<string, string[]>;
}

export async function submitProviders(
  values: SubmitProvidersValues,
  providers: Provider[]
): Promise<SubmitProvidersResult | void> {
  const validatedFields = updateProvidersSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid form data");
  }

  const updatedProviders = providers.map(({ id, ...provider }) => ({
    ...provider,
    enabled: values.providers.includes(provider.publicKey),
    visible: values.providers.includes(provider.publicKey),
  }));

  await upsertProviders(updatedProviders);

  revalidatePath("/admin/setup");
}

export async function listProviders() {
  return list();
}
