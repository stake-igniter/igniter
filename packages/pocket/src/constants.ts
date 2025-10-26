import {RPCType} from "./proto/generated/pocket/shared/service";
import {ValidRPCTypes} from "./types";

/**
 * Represents a mapping of RPC types to their corresponding integer values.
 *
 * This object is used to define and identify various types of Remote Procedure Call (RPC) protocols
 * by assigning each type a unique integer representation.
 *
 * @constant {Object} RPCTypeMap
 * @property {number} UNKNOWN_RPC - Represents an unknown or unspecified RPC type, default value of 0.
 * @property {number} GRPC - Represents the gRPC protocol, assigned with a value of 1.
 * @property {number} WEBSOCKET - Represents WebSocket-based RPC, assigned with a value of 2.
 * @property {number} JSON_RPC - Represents JSON-RPC protocol, assigned with a value of 3.
 * @property {number} REST - Represents REST-based RPC, assigned with a value of 4.
 * @property {number} COMET_BFT - Represents the CometBFT protocol, assigned with a value of 5.
 * @property {number} UNRECOGNIZED - Represents an unrecognized or unsupported RPC type, assigned with a value of -1.
 */
export const RPCTypeMap: Record<ValidRPCTypes, RPCType> = {
  "UNKNOWN_RPC": 0,
  "GRPC": 1,
  "WEBSOCKET": 2,
  "JSON_RPC": 3,
  "REST": 4,
  "COMET_BFT": 5,
  "UNRECOGNIZED": -1,
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
}