"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/DataTable";

import type { Person } from "../types";

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

function formatLocation(person: Person) {
  const location = [person.city, person.state, person.country]
    .filter(Boolean)
    .join(", ");

  return location || "—";
}

/* =========================================================
   TABLE
   ========================================================= */

export default function PeopleTable({ data }: { data: Person[] }) {
  const columns: ColumnDef<Person>[] = [
    /* -------------------------------------------------------
       Person
       ------------------------------------------------------- */

    {
      accessorKey: "name",

      header: "Person",

      cell: ({ row }) => {
        const person = row.original;

        return (
          <div className="min-w-[200px]">
            <Link
              href={`/people/${person.id}`}
              className="font-medium hover:underline"
            >
              {person.name}
            </Link>

            {person.linkedinUrl && (
              <div className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground">
                {person.linkedinUrl}
              </div>
            )}
          </div>
        );
      },
    },

    /* -------------------------------------------------------
       Title
       ------------------------------------------------------- */

    {
      accessorKey: "title",

      header: "Title",

      cell: ({ row }) => <span>{row.original.title || "—"}</span>,
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
       Seniority
       ------------------------------------------------------- */

    {
      accessorKey: "seniority",

      header: "Seniority",

      cell: ({ row }) => <span>{formatEnum(row.original.seniority)}</span>,
    },

    /* -------------------------------------------------------
       Buying Role
       ------------------------------------------------------- */

    {
      accessorKey: "buyingRole",

      header: "Buying Role",

      cell: ({ row }) => <span>{formatEnum(row.original.buyingRole)}</span>,
    },

    /* -------------------------------------------------------
       Decision Maker
       ------------------------------------------------------- */

    {
      id: "decisionMaker",

      header: "Decision Maker",

      accessorFn: (row) => row.isDecisionMaker,

      cell: ({ row }) => (
        <span
          className={
            row.original.isDecisionMaker
              ? "font-medium text-primary"
              : "text-muted-foreground"
          }
        >
          {row.original.isDecisionMaker ? "Yes" : "—"}
        </span>
      ),
    },

    /* -------------------------------------------------------
       Email
       ------------------------------------------------------- */

    {
      accessorKey: "email",

      header: "Email",

      cell: ({ row }) => {
        const email = row.original.email;

        if (!email) {
          return "—";
        }

        return (
          <a href={`mailto:${email}`} className="hover:underline">
            {email}
          </a>
        );
      },
    },

    /* -------------------------------------------------------
       Phone
       ------------------------------------------------------- */

    {
      accessorKey: "phone",

      header: "Phone",

      cell: ({ row }) => {
        const phone = row.original.phone;

        if (!phone) {
          return "—";
        }

        return (
          <a
            href={`tel:${phone}`}
            className="whitespace-nowrap hover:underline"
          >
            {phone}
          </a>
        );
      },
    },

    /* -------------------------------------------------------
       Location
       ------------------------------------------------------- */

    {
      id: "location",

      header: "Location",

      accessorFn: (row) => formatLocation(row),

      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatLocation(row.original)}
        </span>
      ),
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
       Contactability
       ------------------------------------------------------- */

    {
      id: "contactability",

      header: "Contact",

      cell: ({ row }) => {
        const person = row.original;

        if (person.doNotContact) {
          return <span className="text-destructive">Do not contact</span>;
        }

        return (
          <span className="text-muted-foreground">
            {formatEnum(person.preferredContactMethod)}
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
      searchPlaceholder="Search people..."
      enableSorting
      enableFiltering={false}
      enablePagination
      enableColumnVisibility
      enableRowSelection={false}
      emptyMessage="No people yet."
    />
  );
}
