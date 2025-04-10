export interface StakeTransactionMsg {
  type: string;
  value: {
    chains: string[];
    output_address: string;
    public_key: {
      type: string;
      value: string;
    };
    reward_delegators: {
      [key: string]: number;
    };
    service_url: string;
    value: string;
  };
}
