export enum ConfigOptions {
  /** UNKNOWN_CONFIG - Undefined config option */
  UNKNOWN_CONFIG = 0,
  /** TIMEOUT - Timeout setting */
  TIMEOUT = 1,
  UNRECOGNIZED = -1,
}

export enum RPCType {
  /** GRPC - gRPC */
  GRPC = 'GRPC',
  /** WEBSOCKET - WebSocket */
  WEBSOCKET = 'WEBSOCKET',
  /** JSON_RPC - JSON-RPC */
  JSON_RPC = 'JSON_RPC',
  /** REST - REST */
  REST = 'REST',
}

export interface SupplierEndpointConfig {
  key: ConfigOptions;
  value: string;
}

export interface SupplierEndpoint {
  url: string;
  rpcType: RPCType;
  configs?: SupplierEndpointConfig[];
}

export interface ServiceRevShareConfig {
  address: string;
  revSharePercentage: number;
}

export interface SupplierServiceConfig {
  serviceId: string;
  endpoints: SupplierEndpoint[];
  revShare: ServiceRevShareConfig[];
}

export interface Supplier {
  operatorAddress: string;
  stakeAmount: string;
  services: SupplierServiceConfig[];
}

export interface SupplierEndpointInterpolationParams {
  [key: string]: string;
  sid: string;
  rm: string;
  region: string;
  domain: string;
}

export function getSchemeForRpcType(rpcType: RPCType) {
  switch (rpcType) {
    case RPCType.JSON_RPC:
    case RPCType.REST:
      return 'https';
    case RPCType.GRPC:
      return 'grpcs';
    case RPCType.WEBSOCKET:
      return 'wss';
  }
}

export function getUrlTokenFromRpcType(rpcType: RPCType) {
  switch (rpcType) {
    case RPCType.JSON_RPC:
      return 'json';
    case RPCType.REST:
      return 'rest';
    case RPCType.GRPC:
      return 'grpc';
    case RPCType.WEBSOCKET:
      return 'ws';
  }
}

const PROTOCOL_DEFAULT_URL = '{scheme}://{region}-{rm}-{sid}-{protocol}.{domain}';
export const PROTOCOL_DEFAULT_TYPE = RPCType.JSON_RPC;

export function getDefaultUrlWithSchemeByRpcType(rpcType: RPCType) {
  return PROTOCOL_DEFAULT_URL.replace('{scheme}', getSchemeForRpcType(rpcType));
}

export function getEndpointInterpolatedUrl(endpoint: SupplierEndpoint, params: SupplierEndpointInterpolationParams) {
  const protocol = getUrlTokenFromRpcType(endpoint.rpcType);
  const url = endpoint.url || getDefaultUrlWithSchemeByRpcType(endpoint.rpcType);

  const data: Record<string, string> = {
    ...params,
    protocol,
  };

  return url.replace(/{(\w+)}/g, (match, key) => {
    return data[key] || `{${key}}`;
  });
}

export interface SupplierStakeRequest {
  region?: number;
  ownerAddress: string;
  revSharePercentage: number;
  delegatorAddress: string;
  items: StakeDistributionItem[];
}

export interface StakeDistributionItem {
  amount: number;
  qty: number;
}

export interface SupplierReleaseRequest {
  addresses: string[];
}

export interface SupplierMarkStakedRequest {
  addresses: string[];
}
