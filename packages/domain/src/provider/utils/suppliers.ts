import {SupplierEndpointInterpolationParams} from "@igniter/domain/provider/models";
import {RPCType, SupplierEndpoint, Supplier, ServiceConfigUpdate, SupplierServiceConfig} from "@igniter/pocket";
import {PROTOCOL_DEFAULT_URL} from "@igniter/domain/provider/constants";

export function getSchemeForRpcType(rpcType: RPCType) {
    switch (rpcType) {
        case RPCType.JSON_RPC:
        case RPCType.REST:
            return 'https';
        case RPCType.GRPC:
            return 'grpcs';
        case RPCType.WEBSOCKET:
            return 'wss';
        default:
            return 'https';
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
        default:
            return 'json';
    }
}

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

    return url.replace(/{(\w+)}/g, (_match: string, key: string) => {
        return data[key] || `{${key}}`;
    });
}

/**
 * Returns the **unique** list of serviceIds that are considered “active”
 * for a supplier at a given block height.
 *
 * Rules
 * -----
 * 1.  Include every service currently active (`supplier.services`),
 *     **unless** there is an entry in `serviceConfigHistory`
 *     whose `service.serviceId` matches **and** `deactivationHeight` is
 *     greater than the provided `currentHeight`
 *     (i.e., the service is scheduled to be removed).
 *
 * 2.  Include every service that is scheduled to become active
 *     (`activationHeight` > `currentHeight`) and **not** already scheduled
 *     for removal before it becomes active.
 *
 * 3.  The returned list contains each `serviceId` only once.
 *
 * @param supplier      Full supplier object returned from the chain.
 * @param currentHeight Current block height you are evaluating against.
 */
export function getSupplierActiveServices(
  supplier: Supplier,
  currentHeight: number,
): SupplierServiceConfig[] {
  const result = new Set<SupplierServiceConfig>()

  const scheduledDeactivations = new Set<string>()
  supplier.serviceConfigHistory.forEach((h: ServiceConfigUpdate) => {
    if (h.deactivationHeight > currentHeight && h.service?.serviceId) {
      scheduledDeactivations.add(h.service.serviceId)
    }
  })


  supplier.services.forEach((s: SupplierServiceConfig) => {
    if (!scheduledDeactivations.has(s.serviceId)) result.add(s)
  })


  supplier.serviceConfigHistory.forEach((h: ServiceConfigUpdate) => {
    const id = h.service?.serviceId
    const willActivate = h.activationHeight > currentHeight
    const removedBeforeActivation =
      h.deactivationHeight !== 0 && h.deactivationHeight <= currentHeight

    if (willActivate && !removedBeforeActivation) {
      result.add(id)
    }
  })

  return [...result]
}
