import { apiClient } from "@/lib/api/client";
import type {
  CreateLeadInput,
  LeadListResult,
  LeadRecord,
  UpdateLeadInput,
} from "../types";

export const leadsService = {
  fetchLeads: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<LeadListResult>("/api/leads", { params }),

  fetchLeadById: (id: string) =>
    apiClient.get<LeadRecord>(`/api/leads/${id}`),

  createLead: (data: CreateLeadInput) =>
    apiClient.post<LeadRecord>("/api/leads", data),

  updateLead: (id: string, data: UpdateLeadInput) =>
    apiClient.patch<LeadRecord>(`/api/leads/${id}`, data),

  archiveLead: (id: string) =>
    apiClient.delete<void>(`/api/leads/${id}`),
};

export default leadsService;
