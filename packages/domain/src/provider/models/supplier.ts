import {SupplierServiceConfig} from '@igniter/pocket';

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
