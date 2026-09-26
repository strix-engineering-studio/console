import { PersonEditPage } from "@/features/people";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <PersonEditPage id={(await params).id} />; }
