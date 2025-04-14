import {createPrivateKey, sign} from 'crypto';
import {getApplicationSettings} from "@/lib/dal/applicationSettings";

/**
 * Signs the given payload string using Ed25519 and the APP_IDENTITY private key from the environment.
 * The APP_IDENTITY must be a 128-character hex string (64 bytes).
 * @param payload
 */
export async function signPayload(payload: string) {
  const appSettings = await getApplicationSettings();

  const appIdentity = process.env.APP_IDENTITY;

  if (!appIdentity) {
    throw new Error("APP_IDENTITY environment variable is not defined.");
  }

  const privateKeyBytes = Buffer.from(appIdentity.slice(0, 64), 'hex');

  if (privateKeyBytes.length !== 32) {
    throw new Error("APP_IDENTITY must be a 32-byte Ed25519 private key in hex format.");
  }

  const privateKey = createPrivateKey({
    key: Buffer.concat([
      Buffer.from([0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20]),
      privateKeyBytes,
    ]),
    format: 'der',
    type: 'pkcs8',
  });

  return sign(null, Buffer.from(payload), privateKey);
}

/**
 * Returns the Ed25519 public key derived from the APP_IDENTITY private key.
 * The private key must be a 64-byte hex-encoded string.
 */
export async function getAppIdentity() {
  const appIdentity = process.env.APP_IDENTITY;

  if (!appIdentity) {
    throw new Error("APP_IDENTITY environment variable is not defined.");
  }

  return Buffer.from(appIdentity.slice(64, appIdentity.length), 'hex');
}
