import { OrganizationDetailsPage } from "@/features/organizations";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <OrganizationDetailsPage id={(await params).id} />; }
