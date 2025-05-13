import {NextResponse} from "next/server";
import {ensureApplicationIsBootstrapped, validateRequestSignature} from "@/lib/utils/routes";
import {Supplier, SupplierStakeRequest} from "@/lib/models/supplier";
import {APIResponse} from "@/lib/models/response";
import {getSupplierStakeConfigurations} from "@/lib/services/suppliers";
import {REQUEST_IDENTITY_HEADER} from "@/lib/constants";
import {getApplicationSettings} from "@/lib/dal/applicationSettings";

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: Request): Promise<NextResponse<APIResponse<Supplier[] | null>>> {
  try {
    const isBootstrappedResponse = await ensureApplicationIsBootstrapped();
    const settings = await getApplicationSettings();

    if (isBootstrappedResponse instanceof NextResponse) {
      return isBootstrappedResponse;
    }

    const delegatorIdentity = request.headers.get(REQUEST_IDENTITY_HEADER);

    if (!delegatorIdentity) {
      return NextResponse.json({error: `Invalid request. Delegator identity was not provided. REQUEST_IDENTITY_HEADER: ${REQUEST_IDENTITY_HEADER} is required.`}, {status: 400});
    }

    const signatureValidationResponse = await validateRequestSignature<SupplierStakeRequest>(request);

    if (signatureValidationResponse instanceof NextResponse) {
      return signatureValidationResponse;
    }

    const {data} = signatureValidationResponse;

    if (!data || !data.items.length) {
      return NextResponse.json({error: "Invalid request. Empty stake distribution."}, {status: 400});
    }

    const response = await getSupplierStakeConfigurations(data, delegatorIdentity, settings);

    if (!response || response.length === 0) {
      return NextResponse.json(
        {error: "No addresses available"},
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          }
        }
      );
    }

    return NextResponse.json({
      data: response,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: "Invalid request"}, {status: 500});
  }
}
