import {StakeDistributionOffer} from "@/lib/models/StakeDistributionOffer";
import {SignedTransaction} from "@/lib/models/Transactions";

export interface CreateStakeActivityRequest {
  offer: StakeDistributionOffer;
  transaction: SignedTransaction;
}
