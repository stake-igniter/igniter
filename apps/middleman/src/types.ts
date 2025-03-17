import { User } from "./db/schema";

declare global {
  interface Window {
    pocketNetwork: any;
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User;
    isAppBootstrapped: boolean;
  }
}

export type StakeBin = '15k' | '30k' | '45k' | '60k';
