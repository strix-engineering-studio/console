"use client";

import type { CSSProperties } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

const styles = { "--sidebar-width": "260px", "--sidebar-width-icon": "56px", "--header-height": "64px" } as CSSProperties;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider style={styles}><AppSidebar /><SidebarInset className="min-w-0"><SiteHeader />
    <main className="mx-auto min-h-0 w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
  </SidebarInset></SidebarProvider>;
}
