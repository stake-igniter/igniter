import { RPCType } from "@igniter/pocket/proto/pocket/shared/service";

// TODO: Refactor to a common constants package. See: apps/middleman/src/lib/constants.ts:1
export const REQUEST_IDENTITY_HEADER = "X-Middleman-Identity";
export const REQUEST_SIGNATURE_HEADER = "X-Middleman-Signature";

export const labelByRpcType: Record<string, string> = {
  [RPCType.JSON_RPC]: "JSON_RPC",
  [RPCType.GRPC]: "GRPC",
  [RPCType.WEBSOCKET]: "WEBSOCKET",
  [RPCType.REST]: "REST",
}

export const validRpcTypes = [
  RPCType.JSON_RPC,
  RPCType.GRPC,
  RPCType.WEBSOCKET,
  RPCType.REST,
] as const;
