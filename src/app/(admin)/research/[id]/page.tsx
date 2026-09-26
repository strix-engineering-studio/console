import { ResearchDetailsPage } from "@/features/research";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <ResearchDetailsPage id={(await params).id} />; }
