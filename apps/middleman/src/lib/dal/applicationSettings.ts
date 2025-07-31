import "server-only";
import { db } from "@/db";
import {
  ApplicationSettings,
  applicationSettingsTable,
  ChainId, CreateApplicationSettings,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import {getCompressedPublicKeyFromAppIdentity} from "@/lib/crypto";
import {env} from "@/config/env";

const defaultSettings: ApplicationSettings = {
  id: 0,
  name: "",
  supportEmail: "",
  rpcUrl: "",
  indexerApiUrl: "",
  appIdentity: "",
  ownerEmail: "",
  ownerIdentity: "",
  fee: 1,
  minimumStake: 60000,
  isBootstrapped: false,
  delegatorRewardsAddress: '',
  chainId: ChainId.Pocket,
  privacyPolicy: "",
  createdAt: new Date(),
  createdBy: "",
  updatedAt: new Date(),
  updatedBy: "",
  updatedAtHeight: null
};

export async function getApplicationSettings(): Promise<ApplicationSettings> {
  const dbSettings = await getApplicationSettingsFromDatabase();
  const appIdentity = await getCompressedPublicKeyFromAppIdentity();

  const envSettings = {
    chainId: process.env.CHAIN_ID as ChainId,
    ownerIdentity: env.OWNER_IDENTITY,
    ownerEmail: process.env.OWNER_EMAIL!,
    appIdentity: appIdentity.toString('hex'),
  };

  return {
    ...defaultSettings,
    ...envSettings,
    ...(dbSettings ?? {}),
  };
}

export async function getApplicationSettingsFromDatabase() {
  return db.query.applicationSettingsTable.findFirst();
}

export async function insertApplicationSettings(
  settings: Omit<CreateApplicationSettings, 'ownerIdentity' | 'isBootstrapped'>,
): Promise<ApplicationSettings> {
  const insertedSettings = await db
    .insert(applicationSettingsTable)
    .values({
      ...settings,
      ownerIdentity: env.OWNER_IDENTITY,
      isBootstrapped: false,
    })
    .returning()
    .then((res) => res[0]);

  if (!insertedSettings) {
    throw new Error("Failed to insert application settings");
  }

  return insertedSettings;
}

export async function updateApplicationSettings(
  settings: Partial<ApplicationSettings>
): Promise<ApplicationSettings> {
  const existingSettings = await getApplicationSettingsFromDatabase();

  if (!existingSettings?.id) {
    throw new Error("No existing settings found to update");
  }

  const updatedSettings = await db
    .update(applicationSettingsTable)
    .set(settings)
    .where(eq(applicationSettingsTable.id, existingSettings.id))
    .returning()
    .then((res) => res[0]);

  if (!updatedSettings) {
    throw new Error("Failed to update application settings");
  }

  return updatedSettings;
}


export async function isAppBootstrapped() {
  const settings = await getApplicationSettingsFromDatabase();
  return settings?.isBootstrapped ?? false;
}
