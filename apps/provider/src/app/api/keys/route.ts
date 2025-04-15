import { NextResponse } from "next/server";
import {
  getFinalStakeAddresses,
  NodeStakeDistributionItem,
} from "@/lib/dal/addresses";
import { getApplicationSettings } from "@/lib/dal/applicationSettings";
import {getDelegatorByIdentity} from "@/lib/dal/delegators";
import {verifySignature} from "@/lib/crypto";

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

export async function POST(request: Request) {
  try {
    const { isBootstrapped } = await getApplicationSettings();

    if (!isBootstrapped) {
      return NextResponse.json(
        { error: "Forbidden. Application is not ready for requests." },
        { status: 403 }
      );
    }

    const delegatorIdentity = request.headers.get("X-Middleman-Identity");

    if (!delegatorIdentity) {
      return NextResponse.json({ error: "Invalid request. X-Middleman-Identity header was not provided." }, { status: 400 });
    }

    const allowedDelegator = await getDelegatorByIdentity(delegatorIdentity);

    if (!allowedDelegator) {
      return NextResponse.json({ error: "Forbidden. The client is not allowed." }, { status: 403 });
    }

    let data: NodeStakeDistributionItem[];

    try {
      data = await request.json();
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: `Invalid request. Is the request valid JSON?` }, { status: 400 });
    }

    const isValidSignature = verifySignature(
      JSON.stringify(data),
      Buffer.from(allowedDelegator.publicKey, 'hex').toString('base64'),
      request.headers.get("X-Middleman-Signature") || "",
    );

    if (!isValidSignature) {
      return NextResponse.json({ error: `Invalid request. Signature could not be verified with public key: ${allowedDelegator.publicKey}` }, { status: 400 });
    }

    if (!data || !data.length) {
      return NextResponse.json({ error: "Invalid request. Empty node stake distribution." }, { status: 400 });
    }

    const response = await getFinalStakeAddresses(data);

    if (!response || response.length === 0) {
      return NextResponse.json(
        { error: "No addresses available" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          }
        }
      );
    }

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
