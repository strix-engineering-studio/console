"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/DataTable";

import type { Lead, LeadPriority } from "../types";

import { useUpdateLead } from "../services/leads.queries";

/* =========================================================
   CONSTANTS
   ========================================================= */

const statuses: Lead["status"][] = [
  "NEW",
  "RESEARCHING",
  "CONTACTED",
  "ENGAGED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
  "DISQUALIFIED",
];

const priorities: LeadPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

/* =========================================================
   HELPERS
   ========================================================= */

function formatEnum(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString();
}

/* =========================================================
   TABLE
   ========================================================= */

export default function LeadTable({ data }: { data: Lead[] }) {
  const update = useUpdateLead();

  const columns: ColumnDef<Lead>[] = [
    /* -------------------------------------------------------
       Lead
       ------------------------------------------------------- */

    {
      accessorKey: "name",

      header: "Lead",

      cell: ({ row }) => (
        <Link
          className="font-medium hover:underline"
          href={`/leads/${row.original.id}`}
        >
          {row.original.name}
        </Link>
      ),
    },

    /* -------------------------------------------------------
       Organization
       ------------------------------------------------------- */

    {
      id: "organization",

      header: "Organization",

      accessorFn: (row) => row.organization?.name || "—",

      cell: ({ row }) => <span>{row.original.organization?.name || "—"}</span>,
    },

    /* -------------------------------------------------------
       Contact
       ------------------------------------------------------- */

    {
      id: "person",

      header: "Contact",

      accessorFn: (row) => row.person?.name || "—",

      cell: ({ row }) => <span>{row.original.person?.name || "—"}</span>,
    },

    /* -------------------------------------------------------
       Status
       ------------------------------------------------------- */

    {
      accessorKey: "status",

      header: "Status",

      cell: ({ row }) => (
        <select
          aria-label={`Status for ${row.original.name}`}
          value={row.original.status}
          disabled={update.isPending}
          onChange={(event) => {
            const status = event.target.value as Lead["status"];

            update.mutate({
              id: row.original.id,

              input: {
                status,
              },
            });
          }}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {formatEnum(status)}
            </option>
          ))}
        </select>
      ),
    },

    /* -------------------------------------------------------
       Priority
       ------------------------------------------------------- */

    {
      accessorKey: "priority",

      header: "Priority",

      cell: ({ row }) => (
        <span className="text-sm">{formatEnum(row.original.priority)}</span>
      ),
    },

    /* -------------------------------------------------------
       Source
       ------------------------------------------------------- */

    {
      accessorKey: "source",

      header: "Source",

      cell: ({ row }) => (
        <span className="text-sm">{formatEnum(row.original.source)}</span>
      ),
    },

    /* -------------------------------------------------------
       Qualification
       ------------------------------------------------------- */

    {
      accessorKey: "qualificationStatus",

      header: "Qualification",

      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.qualificationStatus
            ? formatEnum(row.original.qualificationStatus)
            : "—"}
        </span>
      ),
    },

    /* -------------------------------------------------------
       Score
       ------------------------------------------------------- */

    {
      accessorKey: "overallScore",

      header: "Score",

      cell: ({ row }) => {
        const score = row.original.overallScore;

        return (
          <span className="text-sm">
            {score != null ? `${Math.round(score)}` : "—"}
          </span>
        );
      },
    },

    /* -------------------------------------------------------
       Estimated Value
       ------------------------------------------------------- */

    {
      accessorKey: "estimatedValue",

      header: "Value",

      cell: ({ row }) => {
        const value = row.original.estimatedValue;

        if (value == null) {
          return "—";
        }

        const currency = row.original.currency || "INR";

        return `${currency} ${value.toLocaleString()}`;
      },
    },

    /* -------------------------------------------------------
       Follow Up
       ------------------------------------------------------- */

    {
      accessorKey: "nextFollowUpAt",

      header: "Next Follow-up",

      cell: ({ row }) => formatDate(row.original.nextFollowUpAt),
    },

    /* -------------------------------------------------------
       Updated
       ------------------------------------------------------- */

    {
      accessorKey: "updatedAt",

      header: "Updated",

      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      enableSearch
      searchKey="name"
      searchPlaceholder="Search leads..."
      enableSorting
      enableFiltering={false}
      enablePagination
      enableColumnVisibility
      enableRowSelection={false}
      emptyMessage="No leads found."
    />
  );
}
