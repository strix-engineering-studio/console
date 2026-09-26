"use client";
import Link from "next/link";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { Lead } from "../types";
import { useUpdateLead } from "../services/leads.queries";
const statuses = ["NEW", "RESEARCHING", "ENGAGED", "CONTACTED", "QUALIFIED", "DISQUALIFIED"];
export default function LeadTable({ data }: { data: Lead[] }) {
  const update = useUpdateLead();
  const columns: ColumnDef<Lead>[] = [
    { accessorKey: "name", header: "Lead", cell: ({ row }) => <Link className="font-medium hover:underline" href={`/leads/${row.original.id}`}>{row.original.name}</Link> },
    { id: "organization", header: "Organization", accessorFn: row => row.organization?.name || "—" },
    { id: "person", header: "Contact", accessorFn: row => row.person?.name || "—" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <select aria-label={`Status for ${row.original.name}`} value={row.original.status} onChange={e => update.mutate({ id: row.original.id, input: { status: e.target.value as never } })} className="rounded-md border bg-background px-2 py-1">{statuses.map(status => <option key={status}>{status}</option>)}</select> },
    { accessorKey: "source", header: "Source" },
    { accessorKey: "updatedAt", header: "Updated", cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString() },
  ];
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return <div className="mt-4 overflow-x-auto rounded-xl border"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-muted/50 text-muted-foreground">{table.getHeaderGroups().map(group => <tr key={group.id}>{group.headers.map(header => <th key={header.id} className="px-4 py-3 font-medium">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map(row => <tr key={row.id} className="border-t">{row.getVisibleCells().map(cell => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}{!data.length && <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">No leads found.</td></tr>}</tbody></table></div>;
}
