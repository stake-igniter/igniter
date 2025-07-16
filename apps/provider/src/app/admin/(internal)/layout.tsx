import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "@/app/globals.css";
import { ThemeProvider } from "@/app/theme";
import { WalletConnectionProvider } from '@/app/context/WalletConnectionProvider'
import { ApplicationSettingsProvider } from "@/app/context/ApplicationSettings";
import { SidebarInset, SidebarProvider } from "@igniter/ui/components/sidebar";
import { AppTopBar } from "@igniter/ui/components/AppTopBar/index";
import PriceWidget from "@/components/PriceWidget";
import CurrentUser from "@/components/CurrentUser";
import { CurrencyContextProvider } from "@igniter/ui/context/currency";
import Sidebar from "@/components/Sidebar";
import QueryClientProvider from '@/app/context/QueryClientProvider'
import { auth } from '@/auth'
import NotificationsProvider from '@igniter/ui/context/Notifications/index'

export const metadata: Metadata = {
  title: "Igniter",
  description: "Light up your earnings with Igniter",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <QueryClientProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ApplicationSettingsProvider>
            <WalletConnectionProvider
              protocol={'shannon'}
              expectedIdentity={session?.user?.identity}
            >
              <CurrencyContextProvider>
                <SidebarProvider className="flex flex-col">
                  <AppTopBar>
                    <PriceWidget />
                    <CurrentUser />
                  </AppTopBar>
                  <div className="flex flex-1">
                    <Sidebar />
                    <SidebarInset>
                      <div className={"w-full h-full flex overflow-x-hidden"}>
                        <div className="flex flex-col w-full gap-6">
                          <NotificationsProvider>
                            {children}
                          </NotificationsProvider>
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
    </QueryClientProvider>
  );
}
