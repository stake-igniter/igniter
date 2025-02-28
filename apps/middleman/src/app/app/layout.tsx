import {CurrencyContextProvider} from "@igniter/ui/context/currency";
import {SidebarInset, SidebarProvider} from "@igniter/ui/components/sidebar";
import AppToBar from "@igniter/ui/components/AppTopBar/index";
import AppSidebar from "@igniter/ui/components/AppSidebar";
import CurrencySelector from "@igniter/ui/components/AppTopBar/CurrencySelector";
import UserMenu from "@igniter/ui/components/AppTopBar/UserMenu";

import OverviewDark from "@/app/assets/icons/dark/overview.svg";
import ActivityDark from "@/app/assets/icons/dark/activity.svg";
import NodesDark from "@/app/assets/icons/dark/nodes.svg";
import SettingsDark from "@/app/assets/icons/dark/settings.svg";
import HelpDark from "@/app/assets/icons/dark/help.svg";
import ContactDark from "@/app/assets/icons/dark/contact.svg";
import PriceWidget from "@/app/components/PriceWidget";



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

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <CurrencyContextProvider>
        <SidebarProvider className="flex flex-col">
          <AppToBar>
              <PriceWidget />
              <CurrencySelector />
              <UserMenu />
          </AppToBar>
          <div className="flex flex-1">
            <AppSidebar
                mainRoutes={mainRoutes}
                footerRoutes={footerRoutes}
                />
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
  );
}
