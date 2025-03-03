import type { Metadata } from "next";
import { Jost, Overpass_Mono } from "next/font/google";
import { PoktWalletContextProvider } from "@/app/context/poktWallet";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme";
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
    <html
      lang="en"
      className={`${overpass_mono.variable} ${jost.variable} overflow-hidden`}
      suppressHydrationWarning
    >
      <body>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <PoktWalletContextProvider>
              {children}
            </PoktWalletContextProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
