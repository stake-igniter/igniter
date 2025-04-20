export interface StatusRequest {}


export interface StatusResponse {
  minimumStake: number;
  providerFee: string;
  domains: string[];
  healthy: boolean;
  delegatorRewardsAddress: string;
}
