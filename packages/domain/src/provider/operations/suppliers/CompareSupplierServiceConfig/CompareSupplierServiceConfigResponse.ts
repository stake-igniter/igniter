export interface CompareSupplierServiceConfigResponse {
  isEqual: boolean;
  diff: {
    type: string;
    value?: any;
  }[]
}