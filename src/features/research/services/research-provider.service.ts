import "server-only";
import type { ResearchSubject } from "../schemas";

export class ResearchUnavailableError extends Error {
  constructor(message: string) { super(message); this.name = "ResearchUnavailableError"; }
}
export async function requestResearch(subject: ResearchSubject): Promise<never> {
  if (!subject.leadId && !subject.organizationId && !subject.personId) throw new ResearchUnavailableError("Choose a lead, organization, or person to research.");
  if (!process.env.AI_PROVIDER_API_KEY || !process.env.SEARCH_PROVIDER_API_KEY) throw new ResearchUnavailableError("Research is unavailable until AI and search providers are configured.");
  throw new ResearchUnavailableError("No research provider adapter is implemented yet.");
}
