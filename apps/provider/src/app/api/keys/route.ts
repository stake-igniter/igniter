import { NextResponse } from "next/server";
import {
  getFinalStakeAddresses,
  NodeStakeDistributionItem,
} from "@/lib/dal/addresses";
import { getApplicationSettings } from "@/lib/dal/applicationSettings";

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
    //maybe middleware checks this
    const { isBootstrapped } = await getApplicationSettings();

    if (!isBootstrapped) {
      return NextResponse.json(
        { error: "Application not bootstrapped" },
        { status: 400 }
      );
    }

    const data: NodeStakeDistributionItem[] = await request.json();

    if (!data || !data.length) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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
