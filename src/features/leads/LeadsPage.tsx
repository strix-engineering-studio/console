"use client";

import React, { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Check,
  ChevronDown,
  MapPin,
  MoreHorizontal,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LeadType = {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  location: string;
  employeeCount: number;
  status: "new" | "researching" | "qualified" | "contacted";
  source: string;
  opportunityScore: number;
};

type LeadStatus = "new" | "researching" | "qualified" | "contacted";

type Lead = Omit<LeadType, "status"> & {
  status: LeadStatus;
  researchStatus: "complete" | "pending";
  contactCount: number;
};

type FilterStatus = "all" | LeadStatus;

const MOCK_LEADS: Lead[] = [
  {
    id: "1",
    companyName: "Acme Technologies",
    domain: "acme.com",
    industry: "FinTech",
    location: "Pune",
    employeeCount: 120,
    status: "qualified",
    researchStatus: "complete",
    source: "Apollo",
    opportunityScore: 91,
    contactCount: 2,
  },
  {
    id: "2",
    companyName: "Finly",
    domain: "finly.com",
    industry: "FinTech",
    location: "Pune",
    employeeCount: 84,
    status: "new",
    researchStatus: "complete",
    source: "Apollo",
    opportunityScore: 87,
    contactCount: 0,
  },
  {
    id: "3",
    companyName: "Orbit Technologies",
    domain: "orbit.com",
    industry: "SaaS",
    location: "Pune",
    employeeCount: 210,
    status: "researching",
    researchStatus: "pending",
    source: "Apollo",
    opportunityScore: 84,
    contactCount: 0,
  },
  {
    id: "4",
    companyName: "Nova Systems",
    domain: "nova.com",
    industry: "Software",
    location: "Pune",
    employeeCount: 175,
    status: "contacted",
    researchStatus: "complete",
    source: "Apollo",
    opportunityScore: 82,
    contactCount: 1,
  },
  {
    id: "5",
    companyName: "TechFlow",
    domain: "techflow.com",
    industry: "Software",
    location: "Pune",
    employeeCount: 62,
    status: "new",
    researchStatus: "pending",
    source: "Apollo",
    opportunityScore: 76,
    contactCount: 0,
  },
];

const STATUS_FILTERS: {
  label: string;
  value: FilterStatus;
}[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "New",
    value: "new",
  },
  {
    label: "Researching",
    value: "researching",
  },
  {
    label: "Qualified",
    value: "qualified",
  },
  {
    label: "Contacted",
    value: "contacted",
  },
];

const INDUSTRIES = [
  "All industries",
  "FinTech",
  "SaaS",
  "Software",
  "HealthTech",
  "EdTech",
  "E-commerce",
];

const EMPLOYEE_RANGES = [
  "Any size",
  "1â€“20",
  "20â€“50",
  "50â€“200",
  "200â€“500",
  "500+",
];

function StatusBadge({ status }: { status: LeadStatus }) {
  const config: Record<
    LeadStatus,
    {
      label: string;
      className: string;
    }
  > = {
    new: {
      label: "New",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    researching: {
      label: "Researching",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    qualified: {
      label: "Qualified",
      className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    contacted: {
      label: "Contacted",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  };

  const current = config[status];

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

function ResearchBadge({ status }: { status: Lead["researchStatus"] }) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <Check className="size-3.5" />
        Complete
      </span>
    );
  }

  return (
    <span className="text-xs font-medium text-muted-foreground">Pending</span>
  );
}

function FilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-10 min-w-36 justify-between rounded-xl px-3 text-sm font-normal"
          >
            <span className="truncate">{value}</span>

            <ChevronDown className="ml-2 size-3.5 shrink-0 text-muted-foreground" />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className="cursor-pointer justify-between"
          >
            <span>{option}</span>

            {value === option && (
              <Check className="size-3.5 text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const LeadsPage: React.FC = () => {
  const router = useRouter();

  const [activeStatus, setActiveStatus] = useState<FilterStatus>("all");

  const [search, setSearch] = useState("");

  const [industry, setIndustry] = useState("All industries");

  const [employeeRange, setEmployeeRange] = useState("Any size");

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return MOCK_LEADS.filter((lead) => {
      const matchesStatus =
        activeStatus === "all" || lead.status === activeStatus;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        lead.companyName.toLowerCase().includes(normalizedSearch) ||
        lead.domain.toLowerCase().includes(normalizedSearch) ||
        lead.industry.toLowerCase().includes(normalizedSearch);

      const matchesIndustry =
        industry === "All industries" || lead.industry === industry;

      const matchesEmployeeRange =
        employeeRange === "Any size" ||
        matchesEmployees(lead.employeeCount, employeeRange);

      return (
        matchesStatus &&
        matchesSearch &&
        matchesIndustry &&
        matchesEmployeeRange
      );
    });
  }, [activeStatus, search, industry, employeeRange]);

  const columns: ColumnDef<Lead>[] = [
    {
      id: "company",
      header: "Company",
      accessorKey: "companyName",
      cell: ({ row }) => {
        const lead = row.original;

        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
              <Building2 className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {lead.companyName}
              </p>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {lead.industry} Â· {lead.domain}
              </p>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {row.original.location}
        </div>
      ),
    },

    {
      accessorKey: "opportunityScore",
      header: "Score",
      cell: ({ row }) => (
        <span className="text-sm font-semibold">
          {row.original.opportunityScore}
        </span>
      ),
    },

    {
      accessorKey: "researchStatus",
      header: "Research",
      cell: ({ row }) => <ResearchBadge status={row.original.researchStatus} />,
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },

    {
      id: "contacts",
      header: "People",
      cell: ({ row }) => {
        const count = row.original.contactCount;

        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserRound className="size-3.5" />
            {count}
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const lead = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}`)}>
                View lead
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push(`/research?lead=${lead.id}`)}
              >
                Research company
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>Add contact</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Leads</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {MOCK_LEADS.length} companies in your Strix workspace.
          </p>
        </div>

        <Link href="/search">
          <Button className="rounded-xl">
            <Search className="size-4" />
            Search Leads
          </Button>
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b">
        {STATUS_FILTERS.map((filter) => {
          const active = activeStatus === filter.value;

          const count =
            filter.value === "all"
              ? MOCK_LEADS.length
              : MOCK_LEADS.filter((lead) => lead.status === filter.value)
                  .length;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveStatus(filter.value)}
              className={`
                relative
                flex
                shrink-0
                items-center
                gap-2
                px-3
                pb-3
                text-sm
                font-medium
                transition-colors
                ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {filter.label}

              <span
                className={`
                  rounded-md
                  px-1.5
                  py-0.5
                  text-[10px]
                  ${
                    active
                      ? "bg-muted text-foreground"
                      : "bg-muted/60 text-muted-foreground"
                  }
                `}
              >
                {count}
              </span>

              {active && (
                <span className="absolute inset-x-0 bottom-0 h-px bg-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search companies..."
            className="h-10 rounded-xl pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={industry}
            options={INDUSTRIES}
            onChange={setIndustry}
          />

          <FilterDropdown
            value={employeeRange}
            options={EMPLOYEE_RANGES}
            onChange={setEmployeeRange}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredLeads}
        searchKey="companyName"
        searchPlaceholder="Search companies..."
        loading={false}
        onRowClick={(lead) => router.push(`/leads/${lead.id}`)}
      />

      {/* Empty state */}
      {filteredLeads.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl border bg-muted/40">
            <Sparkles className="size-5 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-sm font-semibold">No leads found</h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Try changing your search or filters, or discover new companies.
          </p>

          <Link href="/search">
            <Button className="mt-5 rounded-xl">
              <Search className="size-4" />
              Search Leads
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

function matchesEmployees(employeeCount: number, range: string): boolean {
  switch (range) {
    case "1â€“20":
      return employeeCount >= 1 && employeeCount <= 20;

    case "20â€“50":
      return employeeCount > 20 && employeeCount <= 50;

    case "50â€“200":
      return employeeCount > 50 && employeeCount <= 200;

    case "200â€“500":
      return employeeCount > 200 && employeeCount <= 500;

    case "500+":
      return employeeCount > 500;

    default:
      return true;
  }
}

export default LeadsPage;

