import { OrganizationEditPage } from "@/features/organizations";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <OrganizationEditPage id={(await params).id} />; }
