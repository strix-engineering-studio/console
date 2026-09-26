"use client";
import Link from "next/link";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { ResearchRun } from "../types";
export default function ResearchTable({ data }: { data: ResearchRun[] }) {
  const columns: ColumnDef<ResearchRun>[] = [
    { id: "subject", header: "Subject", accessorFn: r => r.lead?.name || r.organization?.name || r.person?.name || "Research run", cell: ({ row, getValue }) => <Link href={`/research/${row.original.id}`} className="font-medium hover:underline">{getValue<string>()}</Link> },
    { accessorKey: "status", header: "Status" }, { accessorKey: "provider", header: "Provider", cell: ({ getValue }) => getValue() || "—" },
    { accessorKey: "startedAt", header: "Started", cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString() },
  ];
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return <div className="mt-5 overflow-x-auto rounded-xl border"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-muted/50 text-muted-foreground">{table.getHeaderGroups().map(g => <tr key={g.id}>{g.headers.map(h => <th key={h.id} className="px-4 py-3 font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map(row => <tr key={row.id} className="border-t">{row.getVisibleCells().map(cell => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}{!data.length && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">No research runs recorded.</td></tr>}</tbody></table></div>;
}
