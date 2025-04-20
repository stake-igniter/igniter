import {z} from "zod";
import urlJoin from 'url-join';
import {getByIdentity} from "@/actions/Providers";
import {Provider} from "@/db/schema";
import {signPayload} from "@/lib/crypto";
import {getApplicationSettings} from "@/lib/dal/applicationSettings";
import {REQUEST_IDENTITY_HEADER, REQUEST_SIGNATURE_HEADER} from "@/lib/constants";

export async function POST(request: Request) {
  const schema = z.object({
    provider: z.string(),
    path: z.string(),
    data: z.any()
  });

  let validatedData: z.infer<typeof schema>;
  let provider: Provider | undefined;
  let identity: string;
  let signature: string;

  try {
    const body = await request.json();
    validatedData = schema.parse(body);
  } catch (error) {
    return new Response("Invalid request payload", {status: 400});
  }

  try {
    provider = await getByIdentity(validatedData.provider);
    if (!provider) {
      return new Response("Provider not found", {status: 404});
    }
  } catch (error) {
    console.error(error);
    return new Response("Unable to load the provider", {status: 500});
  }

  try {
    const applicationSettings = await getApplicationSettings();
    identity = applicationSettings.appIdentity;
  } catch (error) {
    console.error(error);
    return new Response("There has been an error while setting the identity of the app", {status: 500});
  }

  try {
    const signatureBuffer = await signPayload(JSON.stringify(validatedData.data));
    signature = signatureBuffer.toString('base64');
  } catch (error) {
    console.error(error);
    return new Response("There has been an error while signing the payload.", {status: 500});
  }

  try {
    return await fetch(urlJoin(provider.url, validatedData.path), {
      method: 'POST',
      body: JSON.stringify(validatedData.data),
      headers: {
        "Content-Type": "application/json",
        [REQUEST_IDENTITY_HEADER]: identity,
        [REQUEST_SIGNATURE_HEADER]: signature,
      }
    });
  } catch (error) {
    console.error(error);
    return new Response("Unable to fetch the provider", {status: 500});
  }
}
