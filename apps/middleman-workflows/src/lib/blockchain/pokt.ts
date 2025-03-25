import { JsonRpcProvider } from "@pokt-foundation/pocketjs-provider";
import { BlockchainProvider } from ".";

export enum BlockchainProtocol {
  Morse = "morse",
  Shannon = "shannon",
}

class MorsePoktProvider extends JsonRpcProvider implements BlockchainProvider {
  constructor(rpcUrl: string) {
    super({ rpcUrl });
  }
}

class ShannonPoktProvider
  extends JsonRpcProvider
  implements BlockchainProvider
{
  constructor(rpcUrl: string) {
    super({ rpcUrl });
  }
}

const setupMorsePoktProvider = (): MorsePoktProvider => {
  const rpcUrl = process.env.POKT_RPC_URL!;

  return new MorsePoktProvider(rpcUrl);
};

const setupShannonPoktProvider = (): ShannonPoktProvider => {
  const rpcUrl = process.env.POKT_RPC_URL!;

  return new ShannonPoktProvider(rpcUrl);
};

const setupPoktProvider = (
  protocol: BlockchainProtocol
): MorsePoktProvider | ShannonPoktProvider => {
  const rpcUrl = process.env.POKT_RPC_URL;

  if (!rpcUrl) {
    throw new Error("POKT_RPC_URL is not set");
  }

  switch (protocol) {
    case BlockchainProtocol.Morse:
      return setupMorsePoktProvider();
    case BlockchainProtocol.Shannon:
      return setupShannonPoktProvider();
    default:
      throw new Error("Invalid blockchain protocol");
  }
};

export default setupPoktProvider;
