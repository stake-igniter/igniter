import {NextResponse} from "next/server";
import {getApplicationSettings} from "@/lib/dal/applicationSettings";
import {list} from "@/lib/dal/addressGroups";
import {ensureApplicationIsBootstrapped, validateRequestSignature} from "@/lib/utils/routes";
import {StatusRequest, StatusResponse} from "@/lib/models/status";
import {AddressGroup, ProviderFee} from "@/db/schema";
import {list as listServices} from "@/lib/dal/services";
import {getRevShare} from "@/lib/utils/services";

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
    const addressGroups = await list('', false);

    const minimumStake = applicationSettings.minimumStake;

    const fees = addressGroups.reduce((allFees, group) => {
      const groupFees =
        group.addressGroupServices.map((service) =>
          getRevShare(service, '').map((share) => share.revSharePercentage)
        );
      return [...allFees, ...groupFees.flat()];
    }, [] as number[]);
    
    const response: StatusResponse = {
      minimumStake: minimumStake,
      fee: Math.max(...fees).toString(),
      feeType: Array.from(new Set(fees)).length === 1 ? ProviderFee.Fixed : ProviderFee.UpTo,
      regions: getUniqueRegions(addressGroups),
      domains: getUniqueDomains(addressGroups),
      healthy: true,
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
