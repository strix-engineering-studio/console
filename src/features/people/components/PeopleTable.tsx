"use client";
import Link from "next/link";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { Person } from "../types";
export default function PeopleTable({ data }: { data: Person[] }) {
  const columns: ColumnDef<Person>[] = [
    { accessorKey: "name", header: "Person", cell: ({ row }) => <Link href={`/people/${row.original.id}`} className="font-medium hover:underline">{row.original.name}</Link> },
    { accessorKey: "title", header: "Title", cell: ({ getValue }) => getValue() || "—" },
    { id: "organization", header: "Organization", accessorFn: row => row.organization?.name || "—" },
    { accessorKey: "email", header: "Email", cell: ({ getValue }) => getValue() || "—" },
    { id: "leads", header: "Leads", accessorFn: row => row._count?.leads ?? 0 },
  ];
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return <div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-muted/50 text-muted-foreground">{table.getHeaderGroups().map(g => <tr key={g.id}>{g.headers.map(h => <th key={h.id} className="px-4 py-3 font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map(row => <tr key={row.id} className="border-t">{row.getVisibleCells().map(cell => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}{!data.length && <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">No people yet.</td></tr>}</tbody></table></div>;
}
