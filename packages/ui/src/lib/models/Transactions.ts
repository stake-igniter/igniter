export interface SupplierStake {
    operatorAddress: string;
    stakeAmount: string;
    services: {
        serviceId: string;
        revShare: {
            address: string;
            revSharePercentage: number;
        }[];
        endpoints: {
            url: string;
            rpcType: string;
            configs: { key: number; value: string; }[],
        }[];
    }[];
}

export interface StakeTransactionSignaturePayload extends SupplierStake {
  ownerAddress: string;
  signer: string;
}

export interface OperationalFundsTransactionSignaturePayload {
  fromAddress: string;
  toAddress: string;
  amount: string;
}

export type TransactionMessage = StakeMessage | FundsMessage;

export interface StakeMessage {
  typeUrl: '/pocket.supplier.MsgStakeSupplier';
  body: StakeTransactionSignaturePayload;
}

export interface FundsMessage {
  typeUrl: '/cosmos.bank.v1beta1.MsgSend';
  body: OperationalFundsTransactionSignaturePayload;
}

export interface SignedTransaction {
  address: string;
  signedPayload: string;
  unsignedPayload: string;
  estimatedFee: number,
  signature: string;
}

export interface SignedMemoPayload {
  t: string;
  a: string;
  f: string;
}

export interface SignedMemo extends SignedMemoPayload {
  s: string;
  p: string;
}
