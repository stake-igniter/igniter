import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "@/app/globals.css";
import { ThemeProvider } from "@/app/theme";
import { WalletConnectionProvider } from "@igniter/ui/context/WalletConnection/index";
import { ApplicationSettingsProvider } from "@/app/context/ApplicationSettings";
import { SidebarInset, SidebarProvider } from "@igniter/ui/components/sidebar";
import { AppTopBar } from "@igniter/ui/components/AppTopBar/index";
import PriceWidget from "@/components/PriceWidget";
import CurrentUser from "@/components/CurrentUser";
import AppSidebar from "@igniter/ui/components/AppSidebar";
import { CurrencyContextProvider } from "@igniter/ui/context/currency";
import OverviewDark from "@/app/assets/icons/dark/overview.svg";
import ActivityDark from "@/app/assets/icons/dark/activity.svg";
import NodesDark from "@/app/assets/icons/dark/nodes.svg";
import SettingsDark from "@/app/assets/icons/dark/settings.svg";
import HelpDark from "@/app/assets/icons/dark/help.svg";
import ContactDark from "@/app/assets/icons/dark/contact.svg";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Igniter",
  description: "Light up your earnings with Igniter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <ApplicationSettingsProvider>
          <WalletConnectionProvider>
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
                        {children}
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
  );
}
