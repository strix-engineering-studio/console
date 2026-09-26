import { LeadDetailsPage } from "@/features/leads";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <LeadDetailsPage id={(await params).id} />; }
