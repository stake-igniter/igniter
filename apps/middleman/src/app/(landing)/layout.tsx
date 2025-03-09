import type { Metadata } from "next";
import { Jost, Overpass_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "@/app/globals.css";
import { ThemeProvider } from "@/app/theme";
import {WalletConnectionProvider} from "@igniter/ui/context/WalletConnection/index";
import Divider from "@/app/(landing)/components/Divider";
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
      className={`${overpass_mono.variable} ${jost.variable}`}
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
              <div className="flex flex-row justify-center min-h-screen bg-[var(--black-1)]">
                <Divider top={80} />
                <div className="w-[958px] h-full border-x border-[var(--black-dividers)]">
                  <Header />
                  {children}
                  <Footer />
                </div>
              </div>
            </WalletConnectionProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
