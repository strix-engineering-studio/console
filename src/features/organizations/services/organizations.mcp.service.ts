import "server-only";
import { organizationRepository } from "../repositories/organization.repository";
import type { OrganizationInput } from "../schemas";
export const organizationsMcpService = {
  list: (q = "", options?: Parameters<typeof organizationRepository.list>[1]) => organizationRepository.list(q, options),
  get: (id: string) => organizationRepository.findById(id),
  create: (input: OrganizationInput) => organizationRepository.create(input),
  importByIdentity: (records: OrganizationInput[]) => organizationRepository.importByIdentity(records),
  update: (id: string, input: Partial<OrganizationInput>) =>
    organizationRepository.update(id, input),
  delete: (id: string) => organizationRepository.delete(id),
};
