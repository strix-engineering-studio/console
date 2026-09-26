"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationsService } from "./organizations.service";
export const organizationKeys = { all: ["organizations"] as const, list: (q: string) => ["organizations", "list", q] as const, detail: (id: string) => ["organizations", "detail", id] as const };
export function useOrganizations(q = "") { return useQuery({ queryKey: organizationKeys.list(q), queryFn: () => organizationsService.list(q) }); }
export function useOrganization(id: string) { return useQuery({ queryKey: organizationKeys.detail(id), queryFn: () => organizationsService.get(id) }); }
export function useCreateOrganization() { const c = useQueryClient(); return useMutation({ mutationFn: organizationsService.create, onSuccess: () => c.invalidateQueries({ queryKey: organizationKeys.all }) }); }
export function useUpdateOrganization() { const c = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: Parameters<typeof organizationsService.update>[1] }) => organizationsService.update(id, input), onSuccess: () => c.invalidateQueries({ queryKey: organizationKeys.all }) }); }
