import type {Transaction} from "@igniter/db/middleman/schema";
import {SEND_TYPE_URL, STAKE_TYPE_URL} from "@/lib/constants";

export interface NewStake {
  address: string;
  ownerAddress: string;
  stakeAmount: string;
  balance: number;
}

export interface SendOperation {
  typeUrl: typeof SEND_TYPE_URL;
  value: {
    fromAddress: string
    toAddress: string
    amount: Array<{
      denom: string
      amount: number
    }>
  }
}

export interface StakeOperation {
  typeUrl: typeof STAKE_TYPE_URL;
  value: {
    signer: string
    ownerAddress: string
    operatorAddress: string
    stake: {
      denom: string
      amount: number
    }
    services: Array<{
      serviceId: string
      endpoints: Array<{
        url: string
        rpcType: string
        configs: Array<{
          key: string
          value: string
        }>
      }>
      revShare: Array<{
        address: string
        revSharePercentage: string
      }>
    }>
  }
}

export function extractStakedNodes(tx: Transaction) {
  try {
    const {body} = JSON.parse(tx.unsignedPayload);
    const nodes: Record<string, NewStake> = body.messages.reduce((nodes: Record<string, NewStake>, message: StakeOperation | SendOperation) => {
      if (message.typeUrl === STAKE_TYPE_URL) {
        const {stake, operatorAddress, ownerAddress} = message.value;
        nodes[operatorAddress] = {
          address: operatorAddress,
          ownerAddress,
          stakeAmount: stake.amount.toString(),
          balance: nodes[operatorAddress]?.balance || 0,
        };
      }

      if (message.typeUrl === SEND_TYPE_URL) {
        const {toAddress, amount: [balance]} = message.value;
        nodes[toAddress] = {
          address: nodes[toAddress]?.address || '',
          ownerAddress: nodes[toAddress]?.ownerAddress || '',
          stakeAmount: nodes[toAddress]?.stakeAmount || '0',
          balance: Number(balance!.amount),
        };
      }

      return nodes;
    }, {});

    return Object.values(nodes);
  } catch (err) {
    console.log("Something went wrong while parsing the transaction to extract the staked nodes information.");
    console.error(err);
    return [];
  }
}
