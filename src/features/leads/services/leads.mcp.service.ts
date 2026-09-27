import "server-only";
import { leadRepository } from "../repositories/lead.repository";
import type { LeadInput } from "../schemas";
export const leadsMcpService = { list: (q = "") => leadRepository.list(q), get: (id: string) => leadRepository.findById(id), create: (input: LeadInput) => leadRepository.create(input), update: (id: string, input: Partial<LeadInput>) => leadRepository.update(id, input), delete: (id: string) => leadRepository.delete(id) };
