import NextAuth, { DefaultSession } from "next-auth";
import { UserRole } from "./db/schema";

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
    user: {
      /** The user's role. */
      role: UserRole;
      identity: string;
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's role */
    role: UserRole;
    identity: string;
  }
}
