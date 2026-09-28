"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/DataTable";

import type { Activity } from "../types";

export default function ActivityTable({ data }: { data: Activity[] }) {
  const columns: ColumnDef<Activity>[] = [
    {
      accessorKey: "title",
      header: "Activity",

      cell: ({ row }) => (
        <div className="min-w-[240px]">
          <p className="font-medium">{row.original.title}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            {row.original.description ||
              row.original.lead?.name ||
              row.original.organization?.name ||
              row.original.person?.name ||
              row.original.type}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "type",
      header: "Type",

      cell: ({ row }) => (
        <span className="text-sm">{formatActivityType(row.original.type)}</span>
      ),
    },

    {
      id: "relatedTo",
      header: "Related To",

      cell: ({ row }) => {
        const activity = row.original;

        const relatedName =
          activity.lead?.name ||
          activity.organization?.name ||
          activity.person?.name;

        return <span className="text-sm">{relatedName || "—"}</span>;
      },
    },

    {
      accessorKey: "createdAt",
      header: "Date",

      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);

        if (Number.isNaN(date.getTime())) {
          return "—";
        }

        return (
          <span className="whitespace-nowrap text-sm">
            {date.toLocaleString()}
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      enableSearch
      searchKey="title"
      searchPlaceholder="Search activities..."
      enableSorting
      enableFiltering={false}
      enablePagination
      enableColumnVisibility={false}
      enableRowSelection={false}
      emptyMessage="No activities recorded yet."
    />
  );
}

/* =========================================================
   HELPERS
   ========================================================= */

function formatActivityType(type: Activity["type"]) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
