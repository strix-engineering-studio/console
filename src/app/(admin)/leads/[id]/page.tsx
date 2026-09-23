import LeadDetailsPage from "@/features/leads/pages/LeadDetailsPage";

export default async function LeadDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetailsPage id={id} />;
}
