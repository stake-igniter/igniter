"use client";

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@igniter/ui/components/sidebar";
import { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import OverviewDark from "@/app/assets/icons/dark/overview.svg";
import ActivityDark from "@/app/assets/icons/dark/activity.svg";
import NodesDark from "@/app/assets/icons/dark/nodes.svg";
import SettingsDark from "@/app/assets/icons/dark/settings.svg";
import ProvidersDark from "@/app/assets/icons/dark/providers.svg";
import AppSidebar from "@igniter/ui/components/AppSidebar";

export interface AppSidebarRoute {
  title: string;
  url: string;
  icon: ComponentType;
}

export interface AppSidebarProps {}

const mainRoutes = [
  {
    title: "Overview",
    url: "/admin/overview",
    icon: OverviewDark,
  },
  {
    title: "Keys",
    url: "/admin/keys",
    icon: NodesDark,
  },
  {
    title: "Services",
    url: "/admin/services",
    icon: ProvidersDark,
  },
  {
    id: "regions",
    title: "Regions",
    url: "/admin/regions",
    icon: ActivityDark,
  },
  {
    id: "miners",
    title: "Relay Miners",
    url: "/admin/miners",
    icon: ActivityDark,
  },
  {
    id: "groups",
    title: "Address Groups",
    url: "/admin/groups",
    icon: ActivityDark,
  },
  {
    title: "Delegators",
    url: "/admin/delegators",
    icon: SettingsDark,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: SettingsDark,
  }
];

export const dynamic = "force-dynamic";

export default function Sidebar({}: Readonly<AppSidebarProps>) {
  const pathname = usePathname();

  const MainRoutesMenu = mainRoutes.map((route) => (
    <SidebarMenuItem
      key={route.title}
      className={
        pathname.includes((route.id || route.title).toLowerCase())
          ? "bg-muted rounded-lg font-medium text-foreground"
          : ""
      }
    >
      <SidebarMenuButton asChild>
        <Link href={route.url}>
          <route.icon />
          <span>{route.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));

  return (
    <AppSidebar MainRoutes={MainRoutesMenu} FooterRoutes={null} />
  );
}
