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
    console.log('Received a request for suppliers');
    const isBootstrappedResponse = await ensureApplicationIsBootstrapped();
    const settings = await getApplicationSettings();

    if (isBootstrappedResponse instanceof NextResponse) {
      console.log('Application is not bootstrapped. Exiting.');
      return isBootstrappedResponse;
    }

    const delegatorIdentity = request.headers.get(REQUEST_IDENTITY_HEADER);

    if (!delegatorIdentity) {
      console.log(`Invalid request. Delegator identity was not provided. REQUEST_IDENTITY_HEADER: ${REQUEST_IDENTITY_HEADER} is required.`);
      return NextResponse.json({error: `Invalid request. Delegator identity was not provided. REQUEST_IDENTITY_HEADER: ${REQUEST_IDENTITY_HEADER} is required.`}, {status: 400});
    }

    console.log('Validating signature...');
    const signatureValidationResponse = await validateRequestSignature<SupplierStakeRequest>(request);

    if (signatureValidationResponse instanceof NextResponse) {
      console.log('Signature validation failed. Exiting.');
      return signatureValidationResponse;
    }

    console.log('Signature validation successful.');
    const {data} = signatureValidationResponse;


    if (!data || !data.items.length) {
      console.log('Invalid request. Empty stake distribution.');
      return NextResponse.json({error: "Invalid request. Empty stake distribution."}, {status: 400});
    }

    console.log('Generating addresses...');
    const response = await getSupplierStakeConfigurations(data, delegatorIdentity);

    if (!response || response.length === 0) {
      console.log('No addresses available');
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

    console.log('Returning addresses');
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
