import {CurrencyContextProvider} from "@igniter/ui/context/currency";
import {SidebarProvider} from "@igniter/ui/components/sidebar";
import AppTopBar from "@igniter/ui/components/AppTopBar/index";
import OverviewDark from "@/app/assets/icons/dark/overview.svg";
import SettingsDark from "@/app/assets/icons/dark/settings.svg";
import HelpDark from "@/app/assets/icons/dark/help.svg";
import UserMenu from "@igniter/ui/components/UserMenu";


const mainRoutes = [
    {
        title: "Overview",
        url: "/admin/overview",
        icon: OverviewDark,
    },
    {
        title: "Keys",
        url: "/admin/keys",
        icon: OverviewDark,
    },
    {
        title: "Settings",
        url: "/admin/settings",
        icon: SettingsDark,
    },
];

const footerRoutes = [
    {
        title: "Help",
        url: "/help",
        icon: HelpDark,
    }
];

export default function DashboardLayout({
                                            children,
                                        }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <CurrencyContextProvider>
            <SidebarProvider className="flex flex-col">
                <AppTopBar>
                    <UserMenu />
                </AppTopBar>
                <div className="flex flex-1">
                    <div className={"w-full h-full flex overflow-x-hidden"}>
                        <div className="flex flex-col w-full gap-6">
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarProvider>
        </CurrencyContextProvider>
    );
}
