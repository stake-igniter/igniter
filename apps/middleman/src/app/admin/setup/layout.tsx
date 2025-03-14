import type { Metadata } from "next";
import { Jost, Overpass_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "@/app/globals.css";
import { ThemeProvider } from "@/app/theme";
import {WalletConnectionProvider} from "@igniter/ui/context/WalletConnection/index";
import {ApplicationSettingsProvider} from "@/app/context/ApplicationSettings";
import {SidebarInset, SidebarProvider} from "@igniter/ui/components/sidebar";
import {AppTopBar} from "@igniter/ui/components/AppTopBar/index";
import PriceWidget from "@/app/components/PriceWidget";
import CurrencySelector from "@igniter/ui/components/AppTopBar/CurrencySelector";
import CurrentUser from "@/app/components/CurrentUser";
import AppSidebar from "@igniter/ui/components/AppSidebar";
import {CurrencyContextProvider} from "@igniter/ui/context/currency";
import OverviewDark from "@/app/assets/icons/dark/overview.svg";
import ActivityDark from "@/app/assets/icons/dark/activity.svg";
import NodesDark from "@/app/assets/icons/dark/nodes.svg";
import SettingsDark from "@/app/assets/icons/dark/settings.svg";
import HelpDark from "@/app/assets/icons/dark/help.svg";
import ContactDark from "@/app/assets/icons/dark/contact.svg";

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

const mainRoutes = [
  {
    title: "Overview",
    url: "/app/overview",
    icon: OverviewDark,
  },
  {
    title: "Activity",
    url: "/app/activity",
    icon: ActivityDark,
  },
  {
    title: "Nodes",
    url: "/app/nodes",
    icon: NodesDark,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: SettingsDark,
  },
];

const footerRoutes = [
  {
    title: "Help",
    url: "/help",
    icon: HelpDark,
  },
  {
    title: "Contact",
    url: "/contact",
    icon: ContactDark,
  },
];

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
            <AppTopBar>
              <CurrentUser />
            </AppTopBar>
            <div className="flex flex-1">
              <div className={"w-full h-full flex overflow-x-hidden"}>
                <div className="flex flex-col w-full gap-6">
                  {children}
                </div>
              </div>
            </div>
          </WalletConnectionProvider>
        </ApplicationSettingsProvider>
      </ThemeProvider>
    </SessionProvider>
    </body>
    </html>
  );
}
