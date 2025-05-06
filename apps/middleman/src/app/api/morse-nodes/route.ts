import { z } from "zod";

const morseAddressSchema = z.string().length(40).regex(/^[0-9a-fA-F]+$/);

export async function POST(req: Request) {
  const body = await req.json();
  let address: string;

  try {
    address = morseAddressSchema.parse(body.address)
  } catch (error) {
    return new Response("Invalid request payload", {status: 400});
  }

  let cursor: string | null = null;

  const items: Array<{
    address: string;
    serviceDomain: string;
    stakeAmount: number;
    balance: number;
  }> = [];

  while (true) {
    const response = await fetch(process.env.POKTSCAN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.POKTSCAN_API_KEY,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        "operationName": "ListPoktNode",
        "variables": {
          address,
          cursor: cursor || null
        },
        query: "query ListPoktNode($address: String!, $cursor: ID) {\n" +
          "  ListPoktNode(pagination: {limit: 1000, cursor: $cursor, filter: {operator: AND, properties: [{operator: EQ, type: INT, value: \"2\", property: \"status\"}, {operator: EQ, type: STRING, value: $address, property: \"output_address\"}]}}) {\n" +
          "    pageInfo {\n" +
          "      has_next\n" +
          "      next\n" +
          "    }\n" +
          "    items {\n" +
          "      address\n" +
          "      service_domain\n" +
          "      tokens\n" +
          "      balance\n" +
          "    }\n" +
          "  }\n" +
          "}\n",
      }),
    }).then(res => res.json() as Promise<{
      "data": {
        "ListPoktNode": {
          "pageInfo": {
            "has_next": boolean,
            "next": string | null
          },
          "items": Array<{
            "address": string,
            "service_domain": string,
            "tokens": number
            balance: number
          }>
        }
      }
    }>)

    items.push(
      ...response.data.ListPoktNode.items.map(item => ({
        address: item.address,
        serviceDomain: item.service_domain,
        stakeAmount: item.tokens / 1e6,
        balance: item.balance / 1e6,
      }))
    )

    cursor = response.data.ListPoktNode.pageInfo.next

    if (!cursor) {
      break;
    }
  }


  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
