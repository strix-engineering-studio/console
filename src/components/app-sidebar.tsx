import * as React from "react";
import {
  LayoutDashboardIcon,
  SearchIcon,
  UsersIcon,
  MapIcon,
  SearchCheckIcon,
  RadioTowerIcon,
  Settings2Icon,
} from "lucide-react";

import { Link } from "react-router-dom";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Search Leads",
      url: "/search",
      icon: SearchIcon,
    },
    {
      title: "Leads",
      url: "/leads",
      icon: UsersIcon,
    },
    {
      title: "Map",
      url: "/map",
      icon: MapIcon,
    },
    {
      title: "Research",
      url: "/research",
      icon: SearchCheckIcon,
    },
    {
      title: "Signals",
      url: "/signals",
      icon: RadioTowerIcon,
    },
  ],

  settings: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2Icon,
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5"
            >
              <Link to="/" className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center bg-foreground text-background">
                  <span className="font-serif text-lg italic">S</span>
                </div>

                <div className="flex min-w-0 flex-col leading-none">
                  <span className="truncate text-base font-semibold">
                    Strix
                  </span>

                  <span className="text-muted-foreground truncate text-xs">
                    Lead Intelligence
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <Separator />

      {/* Main Navigation */}
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <Separator />

      {/* Footer */}
      <SidebarFooter>
        <NavMain items={data.settings} />

        <p className="text-muted-foreground px-2 pt-2 text-xs">
          Built by{" "}
          <a
            href="https://strix.website"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors hover:text-primary"
          >
            Strix Engineering Studio
          </a>
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
