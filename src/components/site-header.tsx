"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLogout } from "@/features/auth";

const labels: Record<string, string> = {
  dashboard: "Dashboard", leads: "Leads", organizations: "Organizations", people: "People",
  research: "Research", activity: "Activity", map: "Map", settings: "Settings",
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const section = pathname.split("/").filter(Boolean)[0] || "dashboard";
  async function logout() {
    await logoutMutation.mutateAsync();
    router.replace("/auth/login");
    router.refresh();
  }
  return <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm">
    <div className="flex items-center gap-3"><SidebarTrigger aria-label="Toggle sidebar"><Menu className="size-4" /></SidebarTrigger><span className="text-sm font-medium">{labels[section] || "Strix Lead"}</span></div>
    <button onClick={logout} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><LogOut className="size-4" />Sign out</button>
  </header>;
}
