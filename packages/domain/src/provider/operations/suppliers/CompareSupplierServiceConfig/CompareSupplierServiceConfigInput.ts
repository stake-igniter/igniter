import {SupplierServiceConfig} from "@igniter/pocket";

export interface CompareSupplierServiceConfigInput {
    serviceConfigSetA: SupplierServiceConfig[],
    serviceConfigSetB: SupplierServiceConfig[]
}
