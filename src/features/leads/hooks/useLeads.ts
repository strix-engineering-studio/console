"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  CreateLeadInput,
  LeadListResult,
  LeadRecord,
  UpdateLeadInput,
} from "../types";
import leadsService from "../services/leadsService";

export const leadQueryKeys = {
  all: ["leads"] as const,
  list: (params?: Record<string, string | number | undefined>) =>
    ["leads", "list", params] as const,
  detail: (id: string) => ["leads", id] as const,
};

export function useLeadsQuery(
  params?: Record<string, string | number | undefined>,
) {
  return useQuery<LeadListResult>({
    queryKey: leadQueryKeys.list(params),
    queryFn: async () => {
      const response = await leadsService.fetchLeads(params);
      return response.data ?? {
        items: [],
        total: 0,
        page: 1,
        pageSize: 25,
        totalPages: 0,
      };
    },
  });
}

export function useLeadQuery(id: string) {
  return useQuery<LeadRecord | null>({
    queryKey: leadQueryKeys.detail(id),
    queryFn: async () => (await leadsService.fetchLeadById(id)).data,
    enabled: Boolean(id),
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadInput) => leadsService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.all });
      toast.success("Lead created successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) =>
      leadsService.updateLead(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.all });
      if (response.data) {
        queryClient.setQueryData(
          leadQueryKeys.detail(response.data.id),
          response.data,
        );
      }
      toast.success("Lead updated successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useArchiveLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.archiveLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.all });
      toast.success("Lead archived successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
