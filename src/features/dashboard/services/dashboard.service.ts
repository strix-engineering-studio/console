import { apiRequest } from "@/lib/api/client";
export type DashboardSummary = { total: number; fresh: number; researching: number; engaged: number; leads: { id: string; name: string; status: string; updatedAt: string }[]; activityCount: number };
export const dashboardService = { summary: () => apiRequest<DashboardSummary>("/api/dashboard") };
