import "server-only";
import { personRepository } from "../repositories/person.repository";
import type { PersonInput } from "../schemas";
export const peopleMcpService = { list: (q = "") => personRepository.list(q), get: (id: string) => personRepository.findById(id), create: (input: PersonInput) => personRepository.create(input), update: (id: string, input: Partial<PersonInput>) => personRepository.update(id, input), delete: (id: string) => personRepository.delete(id) };
