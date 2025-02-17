import { createUser } from "@/lib/dal";
import { signIn } from "@/auth";

export async function POST(request: Request) {
  const body = await request.json();

  //create user with address as identity, redirect login with message,signature and publicKey
  await createUser(body.address);

  return signIn("siwp", {
    message: JSON.stringify(body.message),
    signature: body.signature,
    publicKey: body.publicKey,
    callbackUrl: "/",
  });
}
