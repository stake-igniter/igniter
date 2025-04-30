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
import HelpDark from "@/app/assets/icons/dark/help.svg";
import ContactDark from "@/app/assets/icons/dark/contact.svg";
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

export const dynamic = "force-dynamic";

export default function Sidebar({}: Readonly<AppSidebarProps>) {
  const pathname = usePathname();

  const MainRoutesMenu = mainRoutes.map((route) => (
    <SidebarMenuItem
      key={route.title}
      className={
        pathname.includes(route.title.toLowerCase())
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

  const FooterRoutesMenu = footerRoutes.map((route) => (
    <SidebarMenuItem
      key={route.title}
      className={
        pathname.includes(route.title.toLowerCase())
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
    <AppSidebar MainRoutes={MainRoutesMenu} FooterRoutes={FooterRoutesMenu} />
  );
}
