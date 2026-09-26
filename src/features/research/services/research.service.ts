import { apiRequest, jsonBody } from "@/lib/api/client";
import type { ResearchRun } from "../types";
import type { ResearchSubject } from "../schemas";
export const researchService = {
  list: () => apiRequest<ResearchRun[]>("/api/research"),
  get: (id: string) => apiRequest<ResearchRun & Record<string, unknown>>(`/api/research/${id}`),
  start: (subject: ResearchSubject) => apiRequest<ResearchRun>("/api/research", jsonBody(subject)),
};
