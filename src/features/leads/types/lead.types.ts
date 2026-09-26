export type Lead = { id: string; name: string; status: string; source: string; updatedAt: string; organization?: { name: string } | null; person?: { name: string } | null };
