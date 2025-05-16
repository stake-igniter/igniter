import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from "./sidebar";

import { SootheLogo } from "@igniter/ui/assets";
import { ComponentType } from "react";

export interface AppSidebarRoute {
  title: string;
  url: string;
  icon: ComponentType;
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  MainRoutes: React.ReactNode;
  FooterRoutes: React.ReactNode;
}

export default function AppSidebar({
  MainRoutes,
  FooterRoutes,
  ...sidebarProps
}: Readonly<AppSidebarProps>) {
  return (
    <Sidebar
      className="top-(--header-height) !h-[calc(100svh-var(--header-height))]"
      {...sidebarProps}
    >
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{MainRoutes}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{FooterRoutes}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/*<SidebarGroup>*/}
        {/*  <SidebarGroupContent>*/}
        {/*    <div className="border rounded-md flex flex-row justify-between items-center py-2 px-4">*/}
        {/*      <div className="flex flex-col">*/}
        {/*        <p className="font-medium">Soothe Wallet</p>*/}
        {/*        <p className="text-(--very-muted-foreground)">Get Extension</p>*/}
        {/*      </div>*/}
        {/*      <div>*/}
        {/*        <SootheLogo />*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*    <div className="p-1 mt-4 text-(--very-muted-foreground)">*/}
        {/*      <p>Igniter © 2024 ToS</p>*/}
        {/*    </div>*/}
        {/*  </SidebarGroupContent>*/}
        {/*</SidebarGroup>*/}
      </SidebarFooter>
    </Sidebar>
  );
}
