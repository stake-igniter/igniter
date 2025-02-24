import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@igniter/ui/components/sidebar";

import OverviewDark from "@/app/assets/icons/dark/overview.svg";
import ActivityDark from "@/app/assets/icons/dark/activity.svg";
import NodesDark from "@/app/assets/icons/dark/nodes.svg";
import ProvidersDark from "@/app/assets/icons/dark/providers.svg";
import SettingsDark from "@/app/assets/icons/dark/settings.svg";
import HelpDark from "@/app/assets/icons/dark/help.svg";
import ContactDark from "@/app/assets/icons/dark/contact.svg";

const mainRoutes = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: OverviewDark,
  },
  {
    title: "Activity",
    url: "/activity",
    icon: ActivityDark,
  },
  {
    title: "Nodes",
    url: "/nodes",
    icon: NodesDark,
  },
  {
    title: "Providers",
    url: "/providers",
    icon: ProvidersDark,
  },
  {
    title: "Settings",
    url: "/settings",
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

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainRoutes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {footerRoutes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
