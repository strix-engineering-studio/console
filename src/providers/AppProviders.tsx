"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: true } },
  }));
  return <QueryClientProvider client={queryClient}><ThemeProvider attribute="class" defaultTheme="system" enableSystem><TooltipProvider>{children}</TooltipProvider></ThemeProvider></QueryClientProvider>;
}
