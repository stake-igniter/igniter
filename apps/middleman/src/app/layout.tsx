import "./globals.css";
import type { Metadata } from "next";
import { Jost, Overpass_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme";
import {WalletConnectionProvider} from "@/app/context/WalletConnection";

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
            <WalletConnectionProvider>
              {children}
            </WalletConnectionProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
