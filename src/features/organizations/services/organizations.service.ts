import { apiRequest, jsonBody } from "@/lib/api/client";
import type { Organization } from "../types";
import type { OrganizationInput } from "../schemas";
export const organizationsService = {
  list: (q = "") => apiRequest<Organization[]>(`/api/organizations?q=${encodeURIComponent(q)}`),
  get: (id: string) => apiRequest<Organization & Record<string, unknown>>(`/api/organizations/${id}`),
  create: (input: OrganizationInput) => apiRequest<Organization>("/api/organizations", jsonBody(input)),
  update: (id: string, input: Partial<OrganizationInput>) => apiRequest<Organization>(`/api/organizations/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
};
