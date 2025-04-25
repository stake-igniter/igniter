export interface StatusRequest {}


export interface StatusResponse {
  minimumStake: number;
  providerFee: string;
  domains: string[];
  regions: string[];
  healthy: boolean;
  delegatorRewardsAddress: string;
}
