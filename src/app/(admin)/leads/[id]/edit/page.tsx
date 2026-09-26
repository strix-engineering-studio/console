import { LeadEditPage } from "@/features/leads";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <LeadEditPage id={(await params).id} />; }
