import type { Metadata } from "next";
import { Jost, Overpass_Mono } from "next/font/google";
import { PoktWalletContextProvider } from "@/app/context/poktWallet";
import { useSession, SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Igniter",
  description: "Light up your earnings with Igniter",
};

const jost = Jost({
  variable: "--font-jost",
  weight: ["400", "600", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const overpass_mono = Overpass_Mono({
  variable: "--font-overpass-mono",
  weight: ["400", "600", "500", "700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.variable}`}>
      <body>
        <SessionProvider>
          <PoktWalletContextProvider>
            <div
              className={
                "w-full h-full flex items-center justify-center overflow-x-hidden"
              }
            >
              <div className={"w-full"}>{children}</div>
            </div>
          </PoktWalletContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
