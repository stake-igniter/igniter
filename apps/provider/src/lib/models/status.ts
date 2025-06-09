import { ProviderFee } from '@/db/schema';

export interface StatusRequest {}


export interface StatusResponse {
  minimumStake: number;
  fee: number;
  feeType: ProviderFee;
  domains: string[];
  regions: string[];
  healthy: boolean;
}
