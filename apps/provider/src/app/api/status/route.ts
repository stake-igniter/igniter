import { NextResponse } from "next/server";
import { getApplicationSettings } from "@/lib/dal/applicationSettings";
import { getAddressGroups } from "@/lib/dal/addressGroups";
import {ensureApplicationIsBootstrapped, validateRequestSignature} from "@/lib/utils/routes";
import {StatusRequest, StatusResponse} from "@/lib/models/status";
import {AddressGroup} from "@/db/schema";

function getUniqueRegions(addressGroups: AddressGroup[]) {
  return Array.from(new Set(addressGroups.map((group) => group.region)).values());
}

function getUniqueDomains(addressGroups: AddressGroup[]) {
  return Array.from(new Set(addressGroups
    .filter((group) => group.domain)
    .map((group) => group.domain!)
  ).values());
}

export async function POST(request: Request) {
  try {
    const isBootstrappedResponse = await ensureApplicationIsBootstrapped();

    if (isBootstrappedResponse instanceof NextResponse) {
      return isBootstrappedResponse;
    }

    const signatureValidationResponse = await validateRequestSignature<StatusRequest>(request);

    if (signatureValidationResponse instanceof NextResponse) {
      return signatureValidationResponse;
    }

    const applicationSettings = await getApplicationSettings();
    const addressGroups = await getAddressGroups();

    const minimumStake = applicationSettings.minimumStake;

    const response: StatusResponse = {
      minimumStake: minimumStake,
      providerFee: applicationSettings.fee,
      regions: getUniqueRegions(addressGroups),
      domains: getUniqueDomains(addressGroups),
      delegatorRewardsAddress: applicationSettings.delegatorRewardsAddress,
      healthy: true,
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
