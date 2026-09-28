import { apiRequest, jsonBody } from "@/lib/api/client";
import type { Lead } from "../types";
import type { LeadInput } from "../schemas";

export const leadsService = {
  list: (q = "") => apiRequest<Lead[]>(`/api/leads?q=${encodeURIComponent(q)}`),
  get: (id: string) =>
    apiRequest<Lead & Record<string, unknown>>(`/api/leads/${id}`),
  create: (input: LeadInput) => apiRequest<Lead>("/api/leads", jsonBody(input)),
  update: (id: string, input: Partial<LeadInput>) =>
    apiRequest<Lead>(`/api/leads/${id}`, {
      ...jsonBody(input),
      method: "PATCH",
    }),
};
