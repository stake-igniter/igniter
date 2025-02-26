import {CurrencyContextProvider} from "@/app/context/currency";
import {SidebarInset, SidebarProvider} from "@igniter/ui/components/sidebar";
import AppBar from "@igniter/ui/components/appbar/AppBar";
import AppSidebar from "@igniter/ui/components/sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <CurrencyContextProvider>
        <SidebarProvider className="flex flex-col">
          <AppBar />
          <div className="flex flex-1">
            <AppSidebar />
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
