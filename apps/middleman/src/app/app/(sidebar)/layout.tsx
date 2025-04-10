import type { Metadata } from "next";
import { Jost, Overpass_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "@/app/globals.css";
import { ThemeProvider } from "@/app/theme";
import { WalletConnectionProvider } from "@igniter/ui/context/WalletConnection/index";
import { ApplicationSettingsProvider } from "@/app/context/ApplicationSettings";
import { SidebarInset, SidebarProvider } from "@igniter/ui/components/sidebar";
import { AppTopBar } from "@igniter/ui/components/AppTopBar/index";
import PriceWidget from "@/app/components/PriceWidget";
import CurrencySelector from "@igniter/ui/components/AppTopBar/CurrencySelector";
import CurrentUser from "@/app/components/CurrentUser";
import { CurrencyContextProvider } from "@igniter/ui/context/currency";
import { auth } from "@/auth";
import Sidebar from "@/app/components/Sidebar";
import { Toaster } from "@igniter/ui/components/sonner";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

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
              <WalletConnectionProvider
                expectedIdentity={session?.user?.identity}
              >
                <CurrencyContextProvider>
                  <SidebarProvider className="flex flex-col">
                    <AppTopBar>
                      <PriceWidget />
                      <CurrencySelector />
                      <CurrentUser />
                    </AppTopBar>
                    <div className="flex flex-1">
                      <Sidebar />
                      <SidebarInset>
                        <div className={"w-full h-full flex overflow-x-hidden"}>
                          <div className="flex flex-col w-full gap-6 h-[calc(100vh-72px)] overflow-y-scroll scrollbar-hidden">
                            {children}
                            <Toaster />
                          </div>
                        </div>
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </CurrencyContextProvider>
              </WalletConnectionProvider>
            </ApplicationSettingsProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
