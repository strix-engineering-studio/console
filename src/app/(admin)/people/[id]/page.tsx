import { PersonDetailsPage } from "@/features/people";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <PersonDetailsPage id={(await params).id} />; }
