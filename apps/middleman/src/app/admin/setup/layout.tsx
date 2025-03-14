import {CurrencyContextProvider} from "@igniter/ui/context/currency";
import {SidebarProvider} from "@igniter/ui/components/sidebar";
import {AppTopBar} from "@igniter/ui/components/AppTopBar/index";
import CurrentUser from "@/app/components/CurrentUser";

export default function SetupLayout({
                                            children,
                                        }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <CurrencyContextProvider>
            <SidebarProvider className="flex flex-col">
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
            </SidebarProvider>
        </CurrencyContextProvider>
    );
}
