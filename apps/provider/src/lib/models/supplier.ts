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

export interface SupplierServiceConfig {
  serviceId: string;
  endpoints: SupplierEndpoint[];
}

export interface Supplier {
  operatorAddress: string;
  stake: string;
  services: SupplierServiceConfig[];
}

export interface SupplierEndpointInterpolationParams {
  [key: string]: string;
  sid: string;
  ag: string;
  region: string;
  protocol: string;
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

const PROTOCOL_DEFAULT_URL = '{scheme}://{region}-{ag}-{sid}-{protocol}.{domain}';
export const PROTOCOL_DEFAULT_TYPE = RPCType.JSON_RPC;

export function getDefaultUrlWithSchemeByRpcType(rpcType: RPCType) {
  return PROTOCOL_DEFAULT_URL.replace('{scheme}', getSchemeForRpcType(rpcType));
}

export function getEndpointInterpolatedUrl(endpoint: SupplierEndpoint, params: SupplierEndpointInterpolationParams) {
  const url = endpoint.url || getDefaultUrlWithSchemeByRpcType(endpoint.rpcType);
  return url.replace(/{(\w+)}/g, (match, key) => {
    return params[key] || '';
  });

}
