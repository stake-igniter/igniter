import { JsonRpcProvider } from "@pokt-foundation/pocketjs-provider";
import { BlockchainProvider } from ".";

class MorsePoktProvider extends JsonRpcProvider implements BlockchainProvider {
  constructor(rpcUrl: string) {
    super({ rpcUrl });
  }
}

const setupPoktProvider = async (): Promise<MorsePoktProvider> => {
  const rpcUrl = process.env.POKT_RPC_URL;
  if (!rpcUrl) {
    throw new Error("POKT_RPC_URL is not set");
  }
  const provider = new MorsePoktProvider(rpcUrl);
  return provider;
};

export default setupPoktProvider;
