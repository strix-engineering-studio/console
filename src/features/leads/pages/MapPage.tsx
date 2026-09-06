"use client";

import { useMemo, useState } from "react";
import { Building2, Search, X } from "lucide-react";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import "leaflet/dist/leaflet.css";

type LeadStatus = "all" | "high-potential" | "new" | "researching";

type Lead = {
  id: string;
  companyName: string;
  location: string;
  industry: string;
  employees: number;
  score: number;
  status: Exclude<LeadStatus, "all" | "high-potential">;
  latitude: number;
  longitude: number;
};

const PUNE_CENTER: [number, number] = [18.5204, 73.8567];

const leads: Lead[] = [
  {
    id: "1",
    companyName: "Acme Technologies",
    location: "Pune",
    industry: "FinTech",
    employees: 120,
    score: 91,
    status: "new",
    latitude: 18.5204,
    longitude: 73.8567,
  },
  {
    id: "2",
    companyName: "Finly",
    location: "Pune",
    industry: "FinTech",
    employees: 84,
    score: 87,
    status: "researching",
    latitude: 18.5679,
    longitude: 73.9143,
  },
  {
    id: "3",
    companyName: "Orbit Technologies",
    location: "Pune",
    industry: "SaaS",
    employees: 210,
    score: 84,
    status: "new",
    latitude: 18.5074,
    longitude: 73.8077,
  },
  {
    id: "4",
    companyName: "Nova Systems",
    location: "Pune",
    industry: "Software",
    employees: 175,
    score: 82,
    status: "researching",
    latitude: 18.559,
    longitude: 73.7868,
  },
  {
    id: "5",
    companyName: "TechFlow",
    location: "Pune",
    industry: "Software",
    employees: 62,
    score: 76,
    status: "new",
    latitude: 18.4869,
    longitude: 73.8271,
  },
  {
    id: "6",
    companyName: "CloudBase",
    location: "Pune",
    industry: "SaaS",
    employees: 94,
    score: 72,
    status: "new",
    latitude: 18.599,
    longitude: 73.755,
  },
  {
    id: "7",
    companyName: "HealthStack",
    location: "Pune",
    industry: "HealthTech",
    employees: 48,
    score: 68,
    status: "researching",
    latitude: 18.471,
    longitude: 73.887,
  },
];

const filters: {
  label: string;
  value: LeadStatus;
}[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "High Potential",
    value: "high-potential",
  },
  {
    label: "New",
    value: "new",
  },
  {
    label: "Researching",
    value: "researching",
  },
];

/**
 * Leaflet's default marker assets are not always resolved
 * correctly when bundled with Vite.
 *
 * Use a simple inline SVG marker instead.
 */
const leadIcon = L.divIcon({
  className: "strix-lead-marker",
  html: `
    <div
      style="
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: hsl(var(--foreground));
        border: 2px solid hsl(var(--background));
        box-shadow: 0 1px 4px rgba(0,0,0,.25);
      "
    ></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const selectedLeadIcon = L.divIcon({
  className: "strix-lead-marker-selected",
  html: `
    <div
      style="
        width: 20px;
        height: 20px;
        border-radius: 9999px;
        background: hsl(var(--foreground));
        border: 3px solid hsl(var(--background));
        box-shadow:
          0 0 0 5px rgba(0,0,0,.08),
          0 2px 8px rgba(0,0,0,.25);
      "
    ></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState<LeadStatus>("all");

  const [search, setSearch] = useState("");

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "high-potential"
            ? lead.score >= 80
            : lead.status === activeFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        lead.companyName.toLowerCase().includes(normalizedSearch) ||
        lead.industry.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">Map</h1>

            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
              {leads.length} leads
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Explore your stored leads across Pune.
          </p>
        </div>

        <Link href="/leads">
          <Button variant="outline" className="rounded-xl">
            <Building2 className="size-4" />
            View leads
          </Button>
        </Link>
      </div>

      {/* Map */}
      <div className="relative mt-5 min-h-[calc(100vh-190px)] flex-1 overflow-hidden rounded-2xl border">
        <MapContainer
          center={PUNE_CENTER}
          zoom={12}
          scrollWheelZoom
          className="absolute inset-0 z-0 h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredLeads.map((lead) => (
            <Marker
              key={lead.id}
              position={[lead.latitude, lead.longitude]}
              icon={selectedLead?.id === lead.id ? selectedLeadIcon : leadIcon}
              eventHandlers={{
                click: () => {
                  setSelectedLead(lead);
                },
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-semibold">{lead.companyName}</p>

                  <p className="mt-1 text-xs text-gray-500">
                    {lead.industry} · {lead.location}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Employees</p>
                      <p className="font-medium">
                        {lead.employees.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Score</p>
                      <p className="font-medium">{lead.score}</p>
                    </div>
                  </div>

                  <Link
                    href={`/leads/${lead.id}`}
                    className="mt-3 block text-xs font-medium underline"
                  >
                    Open lead
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Search + Filters */}
        <div className="absolute left-4 right-4 top-4 z-[1000] flex flex-col gap-3 sm:right-auto sm:w-[420px]">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search companies..."
              className="
                h-11
                rounded-xl
                border
                bg-background/95
                pl-10
                pr-10
                shadow-sm
                backdrop-blur
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-muted-foreground
                  transition-colors
                  hover:text-foreground
                "
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div
            className="
              flex
              w-fit
              max-w-full
              items-center
              gap-1
              overflow-x-auto
              rounded-xl
              border
              bg-background/95
              p-1
              shadow-sm
              backdrop-blur
            "
          >
            {filters.map((filter) => {
              const active = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`
                    shrink-0
                    rounded-lg
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    transition-colors
                    ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result Count */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-xs text-muted-foreground">Showing</p>

          <p className="text-sm font-semibold">
            {filteredLeads.length} of {leads.length} leads
          </p>
        </div>

        {/* Selected Lead Panel */}
        {selectedLead && (
          <LeadPanel
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        )}

        {/* No Results */}
        {filteredLeads.length === 0 && (
          <div className="absolute inset-0 z-[900] flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto rounded-2xl border bg-background/95 px-6 py-5 text-center shadow-lg backdrop-blur">
              <Building2 className="mx-auto size-5 text-muted-foreground" />

              <p className="mt-3 text-sm font-semibold">No leads found</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Try another company or filter.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <div
      className="
        absolute
        bottom-4
        right-4
        z-[1000]
        w-[calc(100%-2rem)]
        max-w-sm
        rounded-2xl
        border
        bg-background/95
        p-5
        shadow-xl
        backdrop-blur
        sm:w-[360px]
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <Building2 className="size-4 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">
              {lead.companyName}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {lead.industry} · {lead.location}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close company panel"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Score */}
      <div className="mt-5 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Opportunity score
          </span>

          <span className="text-lg font-semibold">{lead.score}</span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 space-y-3">
        <DetailRow label="Location" value={lead.location} />

        <DetailRow label="Industry" value={lead.industry} />

        <DetailRow label="Employees" value={lead.employees.toLocaleString()} />

        <DetailRow
          label="Status"
          value={lead.status === "new" ? "New" : "Researching"}
        />

        <DetailRow
          label="Coordinates"
          value={`${lead.latitude.toFixed(4)}, ${lead.longitude.toFixed(4)}`}
        />
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-2">
        <Link href={`/leads/${lead.id}`} className="flex-1">
          <Button className="w-full rounded-xl">Open Lead</Button>
        </Link>

        <Link href="/research">
          <Button variant="outline" className="rounded-xl">
            Research
          </Button>
        </Link>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>

      <span className="truncate text-right text-xs font-medium">{value}</span>
    </div>
  );
}

