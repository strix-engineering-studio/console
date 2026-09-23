"use client";

import React, { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Check,
  ChevronDown,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/tables/DataTable";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  organizationLeadId: string;
  personalLeadId: string;
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
    organizationLeadId: "ORG-LEAD-0001",
    personalLeadId: "PERSONAL-LEAD-0001",
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
    organizationLeadId: "ORG-LEAD-0002",
    personalLeadId: "PERSONAL-LEAD-0002",
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
    organizationLeadId: "ORG-LEAD-0003",
    personalLeadId: "PERSONAL-LEAD-0003",
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
    organizationLeadId: "ORG-LEAD-0004",
    personalLeadId: "PERSONAL-LEAD-0004",
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
    organizationLeadId: "ORG-LEAD-0005",
    personalLeadId: "PERSONAL-LEAD-0005",
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
  "1–20",
  "20–50",
  "50–200",
  "200–500",
  "500+",
];

const MANUAL_LEAD_DEFAULTS = {
  organizationLeadId: "",
  personalLeadId: "",
  companyName: "",
  domain: "",
  industry: "",
  location: "",
  employeeCount: "",
  status: "new" as LeadStatus,
};

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
          <button
            type="button"
            className={buttonVariants({
              variant: "outline",
              className:
                "h-10 min-w-36 justify-between rounded-xl px-3 text-sm font-normal",
            })}
          >
            <span className="truncate">{value}</span>

            <ChevronDown className="ml-2 size-3.5 shrink-0 text-muted-foreground" />
          </button>
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

function ManualLeadDialog({
  open,
  onOpenChange,
  onCreated,
  existingLeads,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (lead: Lead) => void;
  existingLeads: Lead[];
}) {
  const [form, setForm] = useState(MANUAL_LEAD_DEFAULTS);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(MANUAL_LEAD_DEFAULTS);
      setError("");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const employeeCount = Number(form.employeeCount);
    const organizationLeadId = form.organizationLeadId.trim();
    const personalLeadId = form.personalLeadId.trim();
    const hasDuplicateId = existingLeads.some(
      (lead) =>
        lead.organizationLeadId === organizationLeadId ||
        lead.personalLeadId === personalLeadId,
    );

    if (
      !organizationLeadId ||
      !personalLeadId ||
      !form.companyName.trim() ||
      !form.domain.trim() ||
      !form.industry.trim() ||
      !form.location.trim() ||
      !Number.isInteger(employeeCount) ||
      employeeCount < 0 ||
      hasDuplicateId
    ) {
      setError(
        hasDuplicateId
          ? "Organization and personal lead IDs must be unique."
          : "Complete all fields with valid values.",
      );
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationLeadId,
          personalLeadId,
          companyName: form.companyName.trim(),
          domain: form.domain.trim(),
          industry: form.industry.trim(),
          location: form.location.trim(),
          employeeCount,
          status: form.status.toUpperCase(),
          researchStatus: "pending",
          source: "Manual",
          opportunityScore: 0,
          contactCount: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`Lead creation failed with status ${response.status}.`);
      }

      const result = (await response.json()) as { data?: Partial<Lead> };
      const createdLead: Lead = {
        id: result.data?.id ?? crypto.randomUUID(),
        organizationLeadId,
        personalLeadId,
        companyName: form.companyName.trim(),
        domain: form.domain.trim(),
        industry: form.industry.trim(),
        location: form.location.trim(),
        employeeCount,
        status: form.status,
        researchStatus: "pending",
        source: "Manual",
        opportunityScore: 0,
        contactCount: 0,
      };

      onCreated(createdLead);
      handleOpenChange(false);
    } catch (submitError) {
      console.error(submitError);
      setError("Unable to add this lead. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add manual lead</DialogTitle>
          <DialogDescription>
            Add a company to your workspace without running a search.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium">Organization lead ID *</span>
              <Input
                value={form.organizationLeadId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    organizationLeadId: event.target.value,
                  }))
                }
                placeholder="ORG-LEAD-0006"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium">Personal lead ID *</span>
              <Input
                value={form.personalLeadId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    personalLeadId: event.target.value,
                  }))
                }
                placeholder="PERSONAL-LEAD-0006"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium">Company name *</span>
              <Input
                value={form.companyName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    companyName: event.target.value,
                  }))
                }
                placeholder="Acme Technologies"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium">Domain *</span>
              <Input
                value={form.domain}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    domain: event.target.value,
                  }))
                }
                placeholder="acme.com"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium">Industry *</span>
              <Input
                value={form.industry}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    industry: event.target.value,
                  }))
                }
                placeholder="SaaS"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium">Location *</span>
              <Input
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder="Pune"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium">Employees *</span>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.employeeCount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    employeeCount: event.target.value,
                  }))
                }
                placeholder="50"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium">Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as LeadStatus,
                  }))
                }
                className="border-input bg-background h-8 w-full rounded-none border px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              >
                {STATUS_FILTERS.filter((filter) => filter.value !== "all").map(
                  (filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Adding..." : "Add lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const LeadsPage: React.FC = () => {
  const router = useRouter();

  const [activeStatus, setActiveStatus] = useState<FilterStatus>("all");

  const [search, setSearch] = useState("");

  const [industry, setIndustry] = useState("All industries");

  const [employeeRange, setEmployeeRange] = useState("Any size");
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [isManualLeadOpen, setIsManualLeadOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return leads.filter((lead) => {
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
  }, [activeStatus, search, industry, employeeRange, leads]);

  const columns: ColumnDef<Lead>[] = [
    {
      id: "companyName",
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

              <p className="mt-1 truncate text-[10px] text-muted-foreground">
                Org: {lead.organizationLeadId} · Personal: {lead.personalLeadId}
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
                <button
                  type="button"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon",
                    className: "size-8 rounded-lg",
                  })}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </button>
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
            {leads.length} companies in your Strix workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-xl"
            onClick={() => setIsManualLeadOpen(true)}
          >
            <Plus className="size-4" />
            Add manual lead
          </Button>
          <Link href="/search">
            <Button variant="outline" className="rounded-xl">
            <Search className="size-4" />
            Search Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b">
        {STATUS_FILTERS.map((filter) => {
          const active = activeStatus === filter.value;

          const count =
            filter.value === "all"
              ? leads.length
              : leads.filter((lead) => lead.status === filter.value)
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
        enableSearch={false}
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

      <ManualLeadDialog
        open={isManualLeadOpen}
        onOpenChange={setIsManualLeadOpen}
        existingLeads={leads}
        onCreated={(lead) => setLeads((current) => [lead, ...current])}
      />
    </div>
  );
};

function matchesEmployees(employeeCount: number, range: string): boolean {
  switch (range) {
    case "1–20":
      return employeeCount >= 1 && employeeCount <= 20;

    case "20–50":
      return employeeCount > 20 && employeeCount <= 50;

    case "50–200":
      return employeeCount > 50 && employeeCount <= 200;

    case "200–500":
      return employeeCount > 200 && employeeCount <= 500;

    case "500+":
      return employeeCount > 500;

    default:
      return true;
  }
}

export default LeadsPage;
