import "server-only";
import { researchRepository } from "../repositories/research.repository";
import type { ResearchInput } from "../schemas";
export const researchMcpService = { list: () => researchRepository.list(), get: (id: string) => researchRepository.findById(id), create: (input: ResearchInput) => researchRepository.create(input), update: (id: string, input: Partial<ResearchInput>) => researchRepository.update(id, input), delete: (id: string) => researchRepository.delete(id) };
