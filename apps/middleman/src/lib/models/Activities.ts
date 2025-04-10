import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {SignedOperationalFundsTransaction, SignedStakeTransaction} from "@/lib/models/Transactions";

export interface CreateStakeActivityRequest {
  offer: StakeDistributionOffer;
  stakeTransactions: SignedStakeTransaction[];
  operationalFundsTransactions: SignedOperationalFundsTransaction[];
}
