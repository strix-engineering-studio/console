import type { CSSProperties } from "react";
import { Outlet } from "react-router-dom";
import { Bot } from "lucide-react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandMenu } from "@/components/CommandMenu";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const layoutStyles = {
  "--sidebar-width": "280px",
  "--sidebar-width-icon": "56px",
  "--header-height": "64px",
} as CSSProperties;

export default function AdminLayout() {
  return (
    <SidebarProvider style={layoutStyles}>
      <AppSidebar />

      <SidebarInset className="min-w-0">
        <SiteHeader />

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </SidebarInset>

      <CommandMenu />

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Open AI Assistant"
        className="
          fixed
          bottom-6
          right-6
          z-50
          size-14
          rounded-full
          border
          bg-background
          shadow-md
          transition-shadow
          hover:shadow-lg
        "
      >
      <Bot className="size-6" aria-hidden="true" />
      </Button>
    </SidebarProvider>
  );
}
// import type { CSSProperties } from "react";
// import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/app-sidebar";

// import { CommandMenu } from "@/components/CommandMenu";
// import { SiteHeader } from "@/components/site-header";
// import { Outlet } from "react-router-dom";
// import { Bot } from "lucide-react";
// import { Button } from "../ui/button";

// // Server Component — no "use client" needed.
// // SidebarProvider/AppSidebar/SiteHeader have their own client boundaries.
// export default function AdminLayout() {
//   return (
//     <SidebarProvider
//       style={
//         {
//           "--sidebar-width": "280px",
//           "--sidebar-width-icon": "56px",
//           "--header-height": "64px",
//         } as CSSProperties
//       }
//     >
//       <AppSidebar />
//       <SidebarInset>
//         <SiteHeader />
//         <main className="flex flex-1 flex-col">
//           <div className="mx-auto w-full max-w-[1600px] px-6 py-6">
//             <Outlet />
//           </div>
//         </main>
//       </SidebarInset>
//       <CommandMenu />

//       {/* Floating AI Button */}
//       <Button
//         // variant="destructive"
//         size="icon"
//         className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-none bg-white"
//         aria-label="AI Assistant"
//       >
//         <Bot height={56} width={56} />
//       </Button>
//     </SidebarProvider>
//   );
// }
