import { NextResponse } from "next/server";
import { getApplicationSettings } from "@/lib/dal/applicationSettings";
import { getAddressGroups } from "@/lib/dal/addressGroups";
import {ensureApplicationIsBootstrapped, validateRequestSignature} from "@/lib/utils/routes";
import {StatusRequest, StatusResponse} from "@/lib/models/status";

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

    //TODO: needs to check if shannon or morse
    const minimumStake = applicationSettings.minimumStake;

    const response: StatusResponse = {
      minimumStake: minimumStake,
      providerFee: applicationSettings.providerFee,
      domains: addressGroups.map((group) => group.domain),
      delegatorRewardsAddress: applicationSettings.delegatorRewardsAddress,
      healthy: true, //TODO: check if all services are healthy, for future
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
