import { db } from "@/db";
import {addressesTable, AddressGroup, CreateAddress} from "@/db/schema";
import { sha256 } from "js-sha256";
import { getActiveKeyManagementStrategy } from "./keyManagementStrategies";
import { getAddressGroupsByIdentity } from "./addressGroups";
import { KeyManagementStrategyFactory } from "../keyStrategies";
import { Random } from '@cosmjs/crypto';
import {DirectSecp256k1Wallet} from "@cosmjs/proto-signing";

export interface KeyPair {
  public_key: string;
  private_key: string;
  address: string;
}

export interface NodeStakeDistributionItem {
  amount: number;
  qty: number;
}

export async function createKeyPair(): Promise<KeyPair> {
  const privateKey = await Random.getBytes(32);
  const wallet = await DirectSecp256k1Wallet.fromKey(privateKey, 'pokt')
  const [account] = await wallet.getAccounts()
  if (account) {
    return {
      public_key: Buffer.from(account.pubkey).toString('hex'),
      private_key: Buffer.from(privateKey).toString('hex'),
      address: account.address,
    }
  }

  throw new Error('Failed to create key pair')
}

export async function insertAddresses(addresses: CreateAddress[]) {
  return db.insert(addressesTable).values(addresses).returning();
}

export async function getFinalStakeAddresses(
  stakeDistribution: NodeStakeDistributionItem[],
) {
  const keyManagementStrategies = await getActiveKeyManagementStrategy();

  const neededAddresses = stakeDistribution.reduce(
    (acc, { qty }) => acc + qty,
    0
  );

  let addresses: { address: string; addressGroup: AddressGroup, publicKey: string; }[] = [];
  for (const keyManagementStrategy of keyManagementStrategies) {
    if (addresses.length >= neededAddresses) break;

    const addressGroup = await getAddressGroupsByIdentity(
      keyManagementStrategy.addressGroupAssignment
    );

    const strategy = KeyManagementStrategyFactory.create(
      keyManagementStrategy.type,
      addressGroup.id
    );

    const newAddresses = await strategy.getAddresses(
      neededAddresses - addresses.length
    );

    addresses = addresses.concat(
      newAddresses.map(([address, publicKey]) => ({
        address: address,
        publicKey,
        addressGroup,
      }))
    );
  }

  const nodes = stakeDistribution.flatMap(({ amount, qty }) =>
    Array.from({ length: qty }, (_, i) => ({
      address: addresses[i]?.address ?? "",
      publicKey: addresses[i]?.publicKey ?? "",
      bin: amount,
      addressGroup: addresses[i]?.addressGroup,
    }))
  );

  return nodes.map((node) => {
    const serviceUrl = node?.addressGroup?.pattern
      .replace("{{domain}}", node?.addressGroup?.domain)
      .replace("{{identity}}", node?.addressGroup?.identity)
      .replace("{{address}}", node.address);

    return {
      address: node.address,
      publicKey: node.publicKey,
      amount: node.bin,
      chains: node?.addressGroup?.defaultChains,
      serviceUrl,
    };
  });
}
