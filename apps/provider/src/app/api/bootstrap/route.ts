import { isAppBootstrapped } from "@/lib/dal/applicationSettings";

export async function GET(request: Request) {
  const isBootstrapped = await isAppBootstrapped();
  return new Response(JSON.stringify({ isBootstrapped }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
