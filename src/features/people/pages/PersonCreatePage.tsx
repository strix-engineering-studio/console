import Link from "next/link";
import PersonCreateForm from "../components/PersonCreateForm";
export default function PersonCreatePage() { return <section className="mx-auto max-w-3xl"><Link href="/people" className="text-sm text-primary hover:underline">← People</Link><h1 className="mt-4 text-3xl font-semibold">Create person</h1><PersonCreateForm/></section>; }
