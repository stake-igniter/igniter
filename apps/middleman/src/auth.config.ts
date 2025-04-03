import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { bootstrapStatus } from "@/lib/services/bootstrap";
import { SiwpMessage } from "@poktscan/vault-siwp";

const authConfig: NextAuthConfig = {
  providers: [Credentials],
  callbacks: {
    async signIn({ user, credentials }) {
      const isBootstrapped = await bootstrapStatus();

      const { address } = new SiwpMessage(
        JSON.parse((credentials?.message || "{}") as string)
      );

      if (!isBootstrapped && address !== process.env.OWNER_IDENTITY) {
        return "/auth/error?error=OwnerOnly";
      }

      return true;
    },
    async session({ session, token }) {
      // TODO: Remove ts-ignore when we figure out how to set the expected user type across next-auth
      // @ts-ignore
      session.user = token.user;
      return session;
    },
  },
};

export default authConfig;
