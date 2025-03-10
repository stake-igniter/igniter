import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [Credentials],
  callbacks: {
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },
} satisfies NextAuthConfig;
