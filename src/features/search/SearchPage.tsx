"use client";

import React, { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Replace this with your actual search hook when the API is ready.
// import { useLeadSearchQuery } from "../hooks/useLeadSearch";

type LeadType = {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  location: string;
  employeeCount: number;
  status: "new" | "existing" | "researching";
  source: string;
  opportunityScore: number;
};

type LeadStatus = "new" | "existing" | "researching";

type SearchFilters = {
  location: string;
  industry: string;
  employees: string;
  hiring: string;
};

type SearchResultSummary = {
  total: number;
  new: number;
  existing: number;
};

const INITIAL_FILTERS: SearchFilters = {
  location: "Pune",
  industry: "Any Industry",
  employees: "Any Size",
  hiring: "Any",
};

const MOCK_LEADS: LeadType[] = [
  {
    id: "1",
    companyName: "Acme Technologies",
    domain: "acme.com",
    industry: "FinTech",
    location: "Pune",
    employeeCount: 120,
    status: "new",
    source: "Apollo",
    opportunityScore: 91,
  },
  {
    id: "2",
    companyName: "Finly",
    domain: "finly.com",
    industry: "FinTech",
    location: "Pune",
    employeeCount: 84,
    status: "new",
    source: "Apollo",
    opportunityScore: 87,
  },
  {
    id: "3",
    companyName: "Orbit Technologies",
    domain: "orbit.com",
    industry: "FinTech",
    location: "Pune",
    employeeCount: 210,
    status: "existing",
    source: "Apollo",
    opportunityScore: 84,
  },
  {
    id: "4",
    companyName: "Nova Systems",
    domain: "nova.com",
    industry: "SaaS",
    location: "Pune",
    employeeCount: 175,
    status: "existing",
    source: "Apollo",
    opportunityScore: 82,
  },
  {
    id: "5",
    companyName: "TechFlow",
    domain: "techflow.com",
    industry: "Software",
    location: "Pune",
    employeeCount: 62,
    status: "new",
    source: "Apollo",
    opportunityScore: 76,
  },
];

const INDUSTRIES = [
  "Any Industry",
  "FinTech",
  "SaaS",
  "Software",
  "HealthTech",
  "EdTech",
  "E-commerce",
];

const EMPLOYEE_RANGES = [
  "Any Size",
  "1–20",
  "20–50",
  "50–200",
  "200–500",
  "500+",
];

const HIRING_OPTIONS = ["Any", "Hiring", "Not Hiring"];

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="h-10 w-full justify-between rounded-xl px-3 text-sm font-normal"
            >
              <span className="truncate">{value}</span>
              <ChevronDown className="ml-2 size-3.5 shrink-0 text-muted-foreground" />
            </Button>
          }
        />

        <DropdownMenuContent align="start" className="w-52">
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
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const config = {
    new: {
      label: "New",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    existing: {
      label: "Already known",
      className: "bg-muted text-muted-foreground",
    },
    researching: {
      label: "Researching",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
  };

  const current = config[status];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

export const SearchLeadsPage: React.FC = () => {
  const [query, setQuery] = useState(
    "FinTech companies in Pune hiring engineers",
  );

  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);

  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [summary, setSummary] = useState<SearchResultSummary>({
    total: 84,
    new: 61,
    existing: 23,
  });

  /**
   * Replace this with your real API query.
   *
   * Example:
   *
   * const {
   *   data,
   *   isLoading,
   * } = useLeadSearchQuery({
   *   query,
   *   ...filters,
   * });
   */

  const leads = useMemo(() => {
    return MOCK_LEADS;
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);

    /*
     * Real implementation should:
     *
     * 1. Send query + filters to backend.
     * 2. Search configured provider(s).
     * 3. Normalize results.
     * 4. Deduplicate companies.
     * 5. Store search record.
     * 6. Store/merge search results.
     * 7. Return summary + results.
     *
     * Example:
     *
     * await searchLeads({
     *   query,
     *   filters,
     * });
     */

    await new Promise((resolve) => setTimeout(resolve, 700));

    setSummary({
      total: 84,
      new: 61,
      existing: 23,
    });

    setHasSearched(true);
    setIsSearching(false);
  };

  const columns: ColumnDef<LeadType>[] = [
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
                {lead.industry} · {lead.domain}
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
      accessorKey: "employeeCount",
      header: "Employees",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.employeeCount.toLocaleString()}
        </span>
      ),
    },

    {
      accessorKey: "opportunityScore",
      header: "Score",
      cell: ({ row }) => {
        const score = row.original.opportunityScore;

        return <span className="text-sm font-semibold">{score}</span>;
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status as LeadStatus} />
      ),
    },

    {
      id: "action",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const lead = row.original;

        if (lead.status === "existing") {
          return (
            <Link href={`/leads/${lead.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-xs"
              >
                View
              </Button>
            </Link>
          );
        }

        return (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            title="Add lead"
          >
            <Plus className="size-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Search Leads</h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Discover companies in Pune and automatically save relevant results to
          your Strix lead database.
        </p>
      </div>

      {/* Search Card */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <Search className="size-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold">Find companies</h2>

            <p className="text-xs text-muted-foreground">
              Search by company, industry, location, or hiring activity.
            </p>
          </div>
        </div>

        {/* Query */}
        <div className="mt-6">
          <label
            htmlFor="lead-search"
            className="mb-2 block text-xs font-medium text-muted-foreground"
          >
            Search
          </label>

          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />

            <Input
              id="lead-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="e.g. FinTech companies in Pune hiring engineers"
              className="h-12 rounded-xl pl-10 pr-4"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Filters
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterDropdown
              label="Location"
              value={filters.location}
              options={["Pune"]}
              onChange={(location) =>
                setFilters((current) => ({
                  ...current,
                  location,
                }))
              }
            />

            <FilterDropdown
              label="Industry"
              value={filters.industry}
              options={INDUSTRIES}
              onChange={(industry) =>
                setFilters((current) => ({
                  ...current,
                  industry,
                }))
              }
            />

            <FilterDropdown
              label="Employees"
              value={filters.employees}
              options={EMPLOYEE_RANGES}
              onChange={(employees) =>
                setFilters((current) => ({
                  ...current,
                  employees,
                }))
              }
            />

            <FilterDropdown
              label="Hiring"
              value={filters.hiring}
              options={HIRING_OPTIONS}
              onChange={(hiring) =>
                setFilters((current) => ({
                  ...current,
                  hiring,
                }))
              }
            />
          </div>
        </div>

        {/* Search Action */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Search results are automatically saved to Strix.
          </p>

          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="ml-auto min-w-36 rounded-xl"
          >
            {isSearching ? (
              <>
                <span className="mr-2 size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Searching...
              </>
            ) : (
              <>
                <Search className="size-4" />
                Search Leads
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Results */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Search Results</h2>

              {hasSearched && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                  {summary.total}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Companies discovered from your current search.
            </p>
          </div>

          {hasSearched && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{summary.total} found</span>

              <span>·</span>

              <span className="text-emerald-600 dark:text-emerald-400">
                {summary.new} new
              </span>

              <span>·</span>

              <span>{summary.existing} already known</span>
            </div>
          )}
        </div>

        {/* Empty state before first search */}
        {!hasSearched ? (
          <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border bg-muted/40">
              <Sparkles className="size-5 text-muted-foreground" />
            </div>

            <h3 className="mt-4 text-sm font-semibold">
              Start discovering leads
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Search for companies in Pune. Results will be stored automatically
              so you can research and track them later.
            </p>

            <Button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="mt-5 rounded-xl"
            >
              <Search className="size-4" />
              Search Leads
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={leads}
            searchKey="companyName"
            searchPlaceholder="Search results..."
            loading={isSearching}
            onRowClick={(lead) => {
              window.location.href = `/leads/${lead.id}`;
            }}
          />
        )}
      </section>

      {/* Search Result Explanation */}
      {hasSearched && (
        <div className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-4">
          <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

          <div>
            <p className="text-sm font-medium">Search results are persistent</p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              New companies are stored in your Strix database. Existing
              companies are linked to this search instead of creating
              duplicates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchLeadsPage;

