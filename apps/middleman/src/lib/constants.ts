// TODO: Refactor to a common constants package: See apps/provider/src/lib/constants.ts:1
export const REQUEST_IDENTITY_HEADER = "X-Middleman-Identity";
export const REQUEST_SIGNATURE_HEADER = "X-Middleman-Signature";

export enum MessageType {
  Send = '/cosmos.bank.v1beta1.MsgSend',
  Stake = '/pocket.supplier.MsgStakeSupplier',
  Unstake = '/pocket.supplier.MsgUnstakeSupplier',
}
