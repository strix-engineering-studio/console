import "server-only";
import { leadRepository } from "../repositories/lead.repository";
import type { LeadInput } from "../schemas";
export const leadsMcpService = {
  list: (q = "", options?: Parameters<typeof leadRepository.list>[1]) => leadRepository.list(q, options),
  get: (id: string) => leadRepository.findById(id),
  create: (input: LeadInput) => leadRepository.create(input),
  importByKey: (records: Array<LeadInput & { importKey: string }>) => leadRepository.importByKey(records),
  update: (id: string, input: Partial<LeadInput>) =>
    leadRepository.update(id, input),
  delete: (id: string) => leadRepository.delete(id),
};
