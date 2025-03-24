import { NextResponse } from "next/server";
import { getApplicationSettings } from "@/lib/dal/applicationSettings";
import { getAddressGroups } from "@/lib/dal/addressGroups";

export interface StatusResponse {
  minimumStake: number;
  providerFee: string;
  domains: string[];
  healthy: boolean;
}

export async function GET(request: Request) {
  try {
    const applicationSettings = await getApplicationSettings();
    const addressGroups = await getAddressGroups();

    //TODO: needs to check if shannon or morse
    const minimumStake = applicationSettings.minimumStake;

    const response: StatusResponse = {
      minimumStake: minimumStake,
      providerFee: applicationSettings.providerFee,
      domains: addressGroups.map((group) => group.domain),
      healthy: true, //TODO: check if all services are healthy, for future
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
