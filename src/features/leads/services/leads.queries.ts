"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsService } from "./leads.service";

export const leadKeys = {
  all: ["leads"] as const,
  list: (q: string) => ["leads", "list", q] as const,
  detail: (id: string) => ["leads", "detail", id] as const,
};
export function useLeads(q: string) {
  return useQuery({
    queryKey: leadKeys.list(q),
    queryFn: () => leadsService.list(q),
  });
}
export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsService.get(id),
  });
}
export function useCreateLead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: leadsService.create,
    onSuccess: () => client.invalidateQueries({ queryKey: leadKeys.all }),
  });
}
export function useUpdateLead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof leadsService.update>[1];
    }) => leadsService.update(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: leadKeys.all }),
  });
}
