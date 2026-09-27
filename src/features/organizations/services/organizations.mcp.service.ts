import "server-only";
import { organizationRepository } from "../repositories/organization.repository";
import type { OrganizationInput } from "../schemas";
export const organizationsMcpService = {
  list: (q = "") => organizationRepository.list(q),
  get: (id: string) => organizationRepository.findById(id),
  create: (input: OrganizationInput) => organizationRepository.create(input),
  update: (id: string, input: Partial<OrganizationInput>) =>
    organizationRepository.update(id, input),
  delete: (id: string) => organizationRepository.delete(id),
};
