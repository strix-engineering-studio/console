"use client";
import Link from "next/link";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { Organization } from "../types";
export default function OrganizationTable({ data }: { data: Organization[] }) {
  const columns: ColumnDef<Organization>[] = [
    { accessorKey: "name", header: "Organization", cell: ({ row }) => <Link className="font-medium hover:underline" href={`/organizations/${row.original.id}`}>{row.original.name}</Link> },
    { accessorKey: "industry", header: "Industry", cell: ({ getValue }) => getValue() || "—" },
    { id: "location", header: "Location", accessorFn: row => row.city || row.location || row.country || "—" },
    { id: "people", header: "People", accessorFn: row => row._count?.people ?? 0 },
    { id: "leads", header: "Leads", accessorFn: row => row._count?.leads ?? 0 },
  ];
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return <div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-muted/50 text-muted-foreground">{table.getHeaderGroups().map(g => <tr key={g.id}>{g.headers.map(h => <th key={h.id} className="px-4 py-3 font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map(row => <tr key={row.id} className="border-t">{row.getVisibleCells().map(cell => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}{!data.length && <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">No organizations yet.</td></tr>}</tbody></table></div>;
}
