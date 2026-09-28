"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/DataTable";

import type { Organization } from "../types";

/* =========================================================
   HELPERS
   ========================================================= */

function formatEnum(value?: string | null) {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatEmployeeCount(organization: Organization) {
  if (organization.employeeCount != null) {
    return organization.employeeCount.toLocaleString();
  }

  if (
    organization.employeeCountMin != null ||
    organization.employeeCountMax != null
  ) {
    const min = organization.employeeCountMin ?? "?";

    const max = organization.employeeCountMax ?? "?";

    return `${min}–${max}`;
  }

  return "—";
}

/* =========================================================
   TABLE
   ========================================================= */

export default function OrganizationTable({ data }: { data: Organization[] }) {
  const columns: ColumnDef<Organization>[] = [
    /* -------------------------------------------------------
       Organization
       ------------------------------------------------------- */

    {
      accessorKey: "name",

      header: "Organization",

      cell: ({ row }) => {
        const organization = row.original;

        return (
          <div className="min-w-[220px]">
            <Link
              className="font-medium hover:underline"
              href={`/organizations/${organization.id}`}
            >
              {organization.name}
            </Link>

            {organization.website && (
              <div className="mt-0.5 max-w-[260px] truncate text-xs text-muted-foreground">
                {organization.website}
              </div>
            )}
          </div>
        );
      },
    },

    /* -------------------------------------------------------
       Industry
       ------------------------------------------------------- */

    {
      accessorKey: "industry",

      header: "Industry",

      cell: ({ row }) => <span>{row.original.industry || "—"}</span>,
    },

    /* -------------------------------------------------------
       Business Type
       ------------------------------------------------------- */

    {
      accessorKey: "businessType",

      header: "Type",

      cell: ({ row }) => <span>{formatEnum(row.original.businessType)}</span>,
    },

    /* -------------------------------------------------------
       Company Stage
       ------------------------------------------------------- */

    {
      id: "stage",

      header: "Stage",

      accessorFn: (row) => row.companyStage || null,

      cell: ({ row }) => <span>{formatEnum(row.original.companyStage)}</span>,
    },

    /* -------------------------------------------------------
       Employees
       ------------------------------------------------------- */

    {
      id: "employees",

      header: "Employees",

      accessorFn: (row) => row.employeeCount ?? row.employeeCountMin ?? null,

      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatEmployeeCount(row.original)}
        </span>
      ),
    },

    /* -------------------------------------------------------
       Location
       ------------------------------------------------------- */

    {
      id: "location",

      header: "Location",

      accessorFn: (row) =>
        [row.city, row.state, row.country].filter(Boolean).join(", ") || "—",

      cell: ({ row }) => {
        const location = [
          row.original.city,
          row.original.state,
          row.original.country,
        ]
          .filter(Boolean)
          .join(", ");

        return <span className="whitespace-nowrap">{location || "—"}</span>;
      },
    },

    /* -------------------------------------------------------
       Relationship
       ------------------------------------------------------- */

    {
      id: "relationship",

      header: "Relationship",

      accessorFn: (row) => row.relationshipStage || null,

      cell: ({ row }) => (
        <span>{formatEnum(row.original.relationshipStage)}</span>
      ),
    },

    /* -------------------------------------------------------
       Target
       ------------------------------------------------------- */

    {
      id: "target",

      header: "Target",

      accessorFn: (row) => row.isTargetAccount,

      cell: ({ row }) => {
        const isTarget = row.original.isTargetAccount;

        return (
          <span
            className={
              isTarget ? "font-medium text-primary" : "text-muted-foreground"
            }
          >
            {isTarget ? "Yes" : "—"}
          </span>
        );
      },
    },

    /* -------------------------------------------------------
       Client
       ------------------------------------------------------- */

    {
      id: "client",

      header: "Client",

      accessorFn: (row) => row.isClient,

      cell: ({ row }) => {
        const isClient = row.original.isClient;

        return (
          <span
            className={
              isClient ? "font-medium text-primary" : "text-muted-foreground"
            }
          >
            {isClient ? "Yes" : "—"}
          </span>
        );
      },
    },

    /* -------------------------------------------------------
       People
       ------------------------------------------------------- */

    {
      id: "people",

      header: "People",

      accessorFn: (row) => row._count?.people ?? 0,

      cell: ({ row }) => <span>{row.original._count?.people ?? 0}</span>,
    },

    /* -------------------------------------------------------
       Leads
       ------------------------------------------------------- */

    {
      id: "leads",

      header: "Leads",

      accessorFn: (row) => row._count?.leads ?? 0,

      cell: ({ row }) => <span>{row.original._count?.leads ?? 0}</span>,
    },

    /* -------------------------------------------------------
       Research
       ------------------------------------------------------- */

    {
      id: "research",

      header: "Research",

      accessorFn: (row) => row.lastResearchAt || null,

      cell: ({ row }) => {
        const lastResearchAt = row.original.lastResearchAt;

        if (!lastResearchAt) {
          return <span className="text-muted-foreground">Never</span>;
        }

        const date = new Date(lastResearchAt);

        if (Number.isNaN(date.getTime())) {
          return "—";
        }

        return (
          <span className="whitespace-nowrap text-sm">
            {date.toLocaleDateString()}
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
      searchKey="name"
      searchPlaceholder="Search organizations..."
      enableSorting
      enableFiltering={false}
      enablePagination
      enableColumnVisibility
      enableRowSelection={false}
      emptyMessage="No organizations yet."
    />
  );
}
