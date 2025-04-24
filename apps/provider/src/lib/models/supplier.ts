export enum ConfigOptions {
  /** UNKNOWN_CONFIG - Undefined config option */
  UNKNOWN_CONFIG = 0,
  /** TIMEOUT - Timeout setting */
  TIMEOUT = 1,
  UNRECOGNIZED = -1,
}

export enum RPCType {
  /** UNKNOWN_RPC - Undefined RPC type */
  UNKNOWN_RPC = 'UNKNOWN_RPC',
  /** GRPC - gRPC */
  GRPC = 'GRPC',
  /** WEBSOCKET - WebSocket */
  WEBSOCKET = 'WEBSOCKET',
  /** JSON_RPC - JSON-RPC */
  JSON_RPC = 'JSON_RPC',
  /** REST - REST */
  REST = 'REST',
  UNRECOGNIZED = 'UNRECOGNIZED',
}

export interface SupplierEndpointConfig {
  key: ConfigOptions;
  value: string;
}

export interface SupplierEndpoint {
  url: string;
  rpcType: RPCType;
  configs: SupplierEndpointConfig[];
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

