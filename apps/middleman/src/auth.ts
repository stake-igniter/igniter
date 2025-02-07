import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { SiwpMessage } from "@poktscan/vault-siwp";
import { getUser } from "./lib/dal";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "siwp",
      name: "POKT Morse",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
        publicKey: {
          label: "Public Key",
          type: "text",
          placeholder: "0x0",
        },
      },
      authorize: async (credentials) => {
        try {
          const siwp = new SiwpMessage(
            JSON.parse((credentials?.message || "{}") as string)
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL ?? "");

          const result = await siwp.verify({
            signature: (credentials?.signature as string) || "",
            domain: nextAuthUrl.host,
            publicKey: (credentials?.publicKey as string) || "",
          });

          let user;

          if (result.success) {
            console.log("SIWP verification successful");

            user = await getUser(siwp.address);

            return {
              id: user?.id,
              address: user?.identity,
            };
          }
          return null;
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
});
