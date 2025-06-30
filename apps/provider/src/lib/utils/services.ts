import {AddressGroupService} from "@/db/schema";

export function getRevShare(addressGroupService: AddressGroupService, operatorAddress: string) {
  const revShare = addressGroupService.revShare.map(({address, share}) => ({
    address,
    revSharePercentage: share,
  }));

  if (addressGroupService.addSupplierShare) {
    revShare.push({
      address: operatorAddress,
      revSharePercentage: addressGroupService.supplierShare!,
    });
  }

  return revShare.length > 0 ? revShare : [{
    address: operatorAddress,
    revSharePercentage: 0,
  }];
}
