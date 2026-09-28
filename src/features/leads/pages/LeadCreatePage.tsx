import Link from "next/link";
import LeadForm from "../components/LeadForm";
export default function LeadCreatePage() {
  return (
    <section className="mx-auto max-w-3xl">
      <Link href="/leads" className="text-sm text-primary hover:underline">
        ← Leads
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Create lead</h1>
      <LeadForm />
    </section>
  );
}
