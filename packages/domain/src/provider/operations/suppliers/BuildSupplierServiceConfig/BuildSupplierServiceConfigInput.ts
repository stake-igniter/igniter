import {AddressGroupWithDetails, Service} from "@igniter/db/provider/schema";

export interface BuildSupplierServiceConfigInput {
    addressGroup: AddressGroupWithDetails,
    services: Service[],
    requestRevShare: {
        revSharePercentage: number;
        address: string;
    }[],
    operatorAddress: string,
    ownerAddress: string,
}
