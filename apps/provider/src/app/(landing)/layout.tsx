import type { Metadata } from "next";
import { Jost, Overpass_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "@/app/globals.css";
import { ThemeProvider } from "@/app/theme";
import {WalletConnectionProvider} from "@igniter/ui/context/WalletConnection/index";
import {ApplicationSettingsProvider} from "@/app/context/ApplicationSettings";
import Header from "@/app/(landing)/components/Header";
import Footer from "@/app/(landing)/components/Footer";

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
        <ApplicationSettingsProvider>
          <WalletConnectionProvider>
            <div className="flex flex-col items-center justify-center w-full h-dvh">
              {children}
            </div>
          </WalletConnectionProvider>
        </ApplicationSettingsProvider>
      </ThemeProvider>
    </SessionProvider>
    </body>
    </html>
  );
}
