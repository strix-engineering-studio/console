"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityService } from "./activity.service";
export const activityKeys = { all: ["activities"] as const };
export const useActivities = () => useQuery({ queryKey: activityKeys.all, queryFn: activityService.list });
export function useCreateActivity() { const client = useQueryClient(); return useMutation({ mutationFn: activityService.create, onSuccess: () => client.invalidateQueries({ queryKey: activityKeys.all }) }); }
