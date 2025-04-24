import {NextResponse} from "next/server";
import {
  getSupplierStakeConfigurations,
  NodeStakeDistributionItem,
} from "@/lib/dal/addresses";
import {ensureApplicationIsBootstrapped, validateRequestSignature} from "@/lib/utils/routes";
import {Supplier} from "@/lib/models/supplier";
import {APIResponse} from "@/lib/models/response";

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

    if (isBootstrappedResponse instanceof NextResponse) {
      return isBootstrappedResponse;
    }

    const signatureValidationResponse = await validateRequestSignature<NodeStakeDistributionItem[]>(request);

    if (signatureValidationResponse instanceof NextResponse) {
      return signatureValidationResponse;
    }

    const {data} = signatureValidationResponse;

    if (!data || !data.length) {
      return NextResponse.json({error: "Invalid request. Empty node stake distribution."}, {status: 400});
    }

    const response = await getSupplierStakeConfigurations(data);

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
