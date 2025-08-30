import type { CreateKey } from "@igniter/db/provider/schema";
import { KeyState } from "@igniter/db/provider/enums";
import { Random } from "@cosmjs/crypto";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";

export interface CreateKeysParams {
  addressGroupId: number;
  willDeliverTo: string;
  numberOfKeys: number;
  ownerAddress: string;
}

export async function createKeys(params: CreateKeysParams): Promise<CreateKey[]> {
  const newKeys: CreateKey[] = [];

  for (let i = 0; i < params.numberOfKeys; i++) {
    const privateKey = Random.getBytes(32);
    const wallet = await DirectSecp256k1Wallet.fromKey(privateKey, 'pokt');
    const [account] = await wallet.getAccounts();

    if (!account) {
      throw new Error("Failed to create account");
    }

    newKeys.push({
      publicKey: Buffer.from(account.pubkey).toString('hex'),
      privateKey: Buffer.from(privateKey).toString('hex'),
      ownerAddress: params.ownerAddress,
      address: account.address,
      addressGroupId: params.addressGroupId,
      deliveredTo: params.willDeliverTo,
      deliveredAt: new Date(),
      state: KeyState.Delivered
    });
  }

  return newKeys;
}
