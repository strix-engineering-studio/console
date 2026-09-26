import Link from "next/link";
import OrganizationCreateForm from "../components/OrganizationCreateForm";
export default function OrganizationCreatePage() { return <section className="mx-auto max-w-3xl"><Link href="/organizations" className="text-sm text-primary hover:underline">← Organizations</Link><h1 className="mt-4 text-3xl font-semibold">Create organization</h1><OrganizationCreateForm/></section>; }
