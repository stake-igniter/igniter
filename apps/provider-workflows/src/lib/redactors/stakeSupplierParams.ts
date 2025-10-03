import { StakeSupplierParams } from "@igniter/pocket";
import { redactSupplierServiceConfigs } from "./supplierServiceConfig";

export function redactStakeSupplierParams(params: StakeSupplierParams) {
  const {signerPrivateKey, services, ...redactedStakeParams} = params;
  return {
    ...redactedStakeParams,
    services: redactSupplierServiceConfigs(services),
  }
}