export type Person = { id: string; name: string; email?: string | null; phone?: string | null; title?: string | null; organization?: { name: string } | null; _count?: { leads: number } };
