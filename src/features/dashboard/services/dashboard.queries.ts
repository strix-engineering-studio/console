"use client";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "./dashboard.service";
import type { DashboardFilters } from "./dashboard.service";

export const dashboardKeys = { summary: (filters: DashboardFilters) => ["dashboard", "summary", filters] as const };
export const useDashboardSummary = (filters: DashboardFilters) => useQuery({ queryKey: dashboardKeys.summary(filters), queryFn: () => dashboardService.summary(filters) });
