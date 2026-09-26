"use client";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "./dashboard.service";
export const dashboardKeys = { summary: ["dashboard", "summary"] as const };
export const useDashboardSummary = () => useQuery({ queryKey: dashboardKeys.summary, queryFn: dashboardService.summary });
