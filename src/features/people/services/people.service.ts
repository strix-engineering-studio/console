import { apiRequest, jsonBody } from "@/lib/api/client";
import type { Person } from "../types";
import type { PersonInput } from "../schemas";
export const peopleService = {
  list: (q = "") => apiRequest<Person[]>(`/api/people?q=${encodeURIComponent(q)}`),
  get: (id: string) => apiRequest<Person & Record<string, unknown>>(`/api/people/${id}`),
  create: (input: PersonInput) => apiRequest<Person>("/api/people", jsonBody(input)),
  update: (id: string, input: Partial<PersonInput>) => apiRequest<Person>(`/api/people/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
};
