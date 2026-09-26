"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { researchService } from "./research.service";
export const researchKeys = { all: ["research"] as const, detail: (id: string) => ["research", "detail", id] as const };
export const useResearchRuns = () => useQuery({ queryKey: researchKeys.all, queryFn: researchService.list });
export const useResearchRun = (id: string) => useQuery({ queryKey: researchKeys.detail(id), queryFn: () => researchService.get(id) });
export function useStartResearch() { const client = useQueryClient(); return useMutation({ mutationFn: researchService.start, onSuccess: () => client.invalidateQueries({ queryKey: researchKeys.all }) }); }
