// NOTE: if this grows too much, probably worth moving into his own package.
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
