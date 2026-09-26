"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { peopleService } from "./people.service";
export const peopleKeys = { all: ["people"] as const, list: (q: string) => ["people", "list", q] as const, detail: (id: string) => ["people", "detail", id] as const };
export function usePeople(q = "") { return useQuery({ queryKey: peopleKeys.list(q), queryFn: () => peopleService.list(q) }); }
export function usePerson(id: string) { return useQuery({ queryKey: peopleKeys.detail(id), queryFn: () => peopleService.get(id) }); }
export function useCreatePerson() { const c = useQueryClient(); return useMutation({ mutationFn: peopleService.create, onSuccess: () => c.invalidateQueries({ queryKey: peopleKeys.all }) }); }
export function useUpdatePerson() { const c = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: Parameters<typeof peopleService.update>[1] }) => peopleService.update(id, input), onSuccess: () => c.invalidateQueries({ queryKey: peopleKeys.all }) }); }
