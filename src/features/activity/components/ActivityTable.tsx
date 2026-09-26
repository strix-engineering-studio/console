"use client";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { Activity } from "../types";
export default function ActivityTable({ data }: { data: Activity[] }) {
  const columns: ColumnDef<Activity>[] = [
    { accessorKey: "title", header: "Activity", cell: ({ row }) => <><p className="font-medium">{row.original.title}</p><p className="mt-1 text-xs text-muted-foreground">{row.original.description || row.original.lead?.name || row.original.organization?.name || row.original.person?.name || row.original.type}</p></> },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "createdAt", header: "Date", cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString() },
  ];
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return <div className="mt-6 overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-muted/50 text-muted-foreground">{table.getHeaderGroups().map(g => <tr key={g.id}>{g.headers.map(h => <th key={h.id} className="px-4 py-3 font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map(row => <tr key={row.id} className="border-t">{row.getVisibleCells().map(cell => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}{!data.length && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">No activities recorded yet.</td></tr>}</tbody></table></div>;
}
