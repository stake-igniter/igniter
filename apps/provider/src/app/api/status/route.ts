import {NextResponse} from "next/server";
import {getApplicationSettings} from "@/lib/dal/applicationSettings";
import {list} from "@/lib/dal/addressGroups";
import {list as listRegions} from '@/lib/dal/regions';
import {ensureApplicationIsBootstrapped, validateRequestSignature} from "@/lib/utils/routes";
import {StatusRequest, StatusResponse} from "@/lib/models/status";
import {AddressGroupWithDetails, ProviderFee} from "@/db/schema";
import {getRevShare} from "@/lib/utils/services";

async function getUniqueRegions(): Promise<string[]> {
  const regions = await listRegions();
  return regions.map((region) => region.displayName);
}

function getUniqueDomains(addressGroups: AddressGroupWithDetails[]) {
  return Array.from(new Set(addressGroups
    .filter((group) => group.relayMiner.domain)
    .map((group) => group.relayMiner.domain!)
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
    const addressGroups = await list(false);

    const minimumStake = applicationSettings.minimumStake;

    const fees = addressGroups.reduce((allFees, group) => {
      const groupFees =
        group.addressGroupServices.map((service) =>
          getRevShare(service, '').map((share) => share.revSharePercentage)
        );

      return [...allFees, ...groupFees.flat()];
    }, [] as number[]);

    const regions = await getUniqueRegions();
    
    const response: StatusResponse = {
      regions,
      minimumStake: minimumStake,
      fee: Math.max(...fees),
      feeType: Array.from(new Set(fees)).length === 1 ? ProviderFee.Fixed : ProviderFee.UpTo,
      domains: getUniqueDomains(addressGroups),
      healthy: true,
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
