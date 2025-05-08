import {CreateKey} from "@/db/schema";
import {Random} from "@cosmjs/crypto";
import {DirectSecp256k1Wallet} from "@cosmjs/proto-signing";

export async function createPartialKey(): Promise<Partial<CreateKey>> {
  const privateKey = Random.getBytes(32);

  const wallet = await DirectSecp256k1Wallet.fromKey(privateKey, 'pokt');

  const [account] = await wallet.getAccounts();

  if (!account) {
    throw new Error("Failed to create account");
  }

  return {
    publicKey: Buffer.from(account.pubkey).toString('hex'),
    privateKey: Buffer.from(privateKey).toString('hex'),
    address: account.address,
  };
}
