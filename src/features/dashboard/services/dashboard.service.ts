import { apiRequest } from "@/lib/api/client";
import type { DashboardFilters, DashboardSummary } from "../types/dashboard.types";

export type { DashboardFilters, DashboardSummary } from "../types/dashboard.types";

export const dashboardService = {
  summary: (filters: DashboardFilters) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
    return apiRequest<DashboardSummary>(`/api/dashboard${params.size ? `?${params.toString()}` : ""}`);
  },
};
