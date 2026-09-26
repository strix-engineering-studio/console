"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Building2, LayoutDashboard, Map, SearchCheck, Settings, UsersRound, UserRound } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const items = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Leads", "/leads", UserRound],
  ["Organizations", "/organizations", Building2],
  ["People", "/people", UsersRound],
  ["Research", "/research", SearchCheck],
  ["Activity", "/activity", Activity],
  ["Map", "/map", Map],
  ["Settings", "/settings", Settings],
] as const;

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return <Sidebar collapsible="offcanvas" {...props}>
    <SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" render={<Link href="/dashboard" className="flex items-center gap-3" />}>
      <span className="flex size-9 items-center justify-center bg-foreground font-serif text-lg italic text-background">S</span>
      <span className="flex flex-col"><span className="font-semibold">Strix Lead</span><span className="text-xs text-muted-foreground">Lead intelligence</span></span>
    </SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
    <Separator />
    <SidebarContent><SidebarMenu className="gap-1 p-2">{items.map(([label, href, Icon]) => <SidebarMenuItem key={href}>
      <SidebarMenuButton isActive={pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`))} render={<Link href={href} />}>
        <Icon className="size-4" /><span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>)}</SidebarMenu></SidebarContent>
  </Sidebar>;
}
