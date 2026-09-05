import Link from "next/link";
import {
  ArrowRightIcon,
  Building2Icon,
  MapPinIcon,
  SearchCheckIcon,
  SignalIcon,
  TrendingUpIcon,
} from "lucide-react";

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {value}
          </h2>
        </div>

        <div className="flex size-9 items-center justify-center rounded-xl border bg-muted/40">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

const priorityLeads = [
  {
    name: "Acme Technologies",
    location: "Pune",
    score: 91,
  },
  {
    name: "Finly",
    location: "Pune",
    score: 87,
  },
  {
    name: "Orbit Technologies",
    location: "Pune",
    score: 84,
  },
  {
    name: "Nova Systems",
    location: "Pune",
    score: 82,
  },
];

const signals = [
  {
    title: "New CTO detected",
    company: "Acme Technologies",
    time: "2h ago",
  },
  {
    title: "Engineering hiring increased",
    company: "Finly",
    time: "5h ago",
  },
  {
    title: "Recent funding detected",
    company: "Orbit Technologies",
    time: "1d ago",
  },
];

const researchQueue = [
  {
    name: "Acme Technologies",
    priority: "High",
  },
  {
    name: "Finly",
    priority: "High",
  },
  {
    name: "Nova Systems",
    priority: "Medium",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>

        <p className="mt-2 text-muted-foreground">
          Your Pune lead intelligence overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Leads"
          value="127"
          description="+14 added this week"
          icon={Building2Icon}
        />

        <StatCard
          label="High Potential"
          value="18"
          description="+4 identified this week"
          icon={TrendingUpIcon}
        />

        <StatCard
          label="Research Queue"
          value="32"
          description="8 ready for review"
          icon={SearchCheckIcon}
        />

        <StatCard
          label="New Signals"
          value="9"
          description="Detected in the last 7 days"
          icon={SignalIcon}
        />
      </div>

      {/* Map + Priority Leads */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)]">
        {/* Pune Map */}
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="font-semibold">Pune Lead Map</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Your stored leads across Pune.
              </p>
            </div>

            <Link
              href="/map"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Open map
            </Link>
          </div>

          {/* Map placeholder */}
          <div className="relative min-h-[420px] overflow-hidden bg-muted/20">
            {/* Grid */}
            <div
              className="
                absolute
                inset-0
                opacity-40
                [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)]
                [background-size:48px_48px]
              "
            />

            {/* Pune label */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full border bg-background shadow-sm">
                  <MapPinIcon className="size-4" />
                </div>

                <span className="rounded-md border bg-background/90 px-2 py-1 text-xs font-medium shadow-sm">
                  Pune
                </span>
              </div>
            </div>

            {/* Temporary lead markers */}
            <MapMarker className="left-[22%] top-[30%]" />
            <MapMarker className="left-[38%] top-[45%]" />
            <MapMarker className="left-[55%] top-[28%]" />
            <MapMarker className="left-[68%] top-[50%]" />
            <MapMarker className="left-[45%] top-[68%]" />
            <MapMarker className="left-[76%] top-[72%]" />
            <MapMarker className="left-[28%] top-[72%]" />

            {/* Map count */}
            <div className="absolute bottom-4 left-4 rounded-lg border bg-background/95 px-3 py-2 shadow-sm">
              <p className="text-xs text-muted-foreground">Leads in Pune</p>

              <p className="mt-0.5 font-semibold">127</p>
            </div>
          </div>
        </div>

        {/* Priority Leads */}
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="font-semibold">Priority Leads</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Highest opportunity accounts.
              </p>
            </div>
          </div>

          <div className="divide-y">
            {priorityLeads.map((lead) => (
              <Link
                key={lead.name}
                href="/leads"
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lead.name}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {lead.location}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold">{lead.score}</span>

                  <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>

          <div className="border-t p-4">
            <Link
              href="/leads"
              className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              View all leads
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Signals + Research */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Signals */}
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="font-semibold">Recent Signals</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Recent changes detected across your leads.
              </p>
            </div>

            <Link
              href="/signals"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          </div>

          <div className="divide-y">
            {signals.map((signal) => (
              <Link
                key={`${signal.company}-${signal.title}`}
                href="/signals"
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground" />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {signal.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {signal.company}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {signal.time}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Research Queue */}
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="font-semibold">Research Queue</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Companies ready for deeper research.
              </p>
            </div>

            <Link
              href="/research"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View queue
            </Link>
          </div>

          <div className="divide-y">
            {researchQueue.map((company) => (
              <Link
                key={company.name}
                href="/research"
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{company.name}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {company.priority} priority
                  </p>
                </div>

                <span className="rounded-lg border px-2.5 py-1.5 text-xs font-medium">
                  Research
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">Recent Searches</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Searches that created or updated your lead dataset.
            </p>
          </div>

          <Link
            href="/search"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Search leads
          </Link>
        </div>

        <div className="divide-y">
          <RecentSearch
            query="FinTech companies in Pune"
            results="84 results"
            time="Today"
          />

          <RecentSearch
            query="SaaS companies in Pune"
            results="126 results"
            time="Yesterday"
          />

          <RecentSearch
            query="Software companies hiring engineers"
            results="73 results"
            time="3 days ago"
          />
        </div>
      </div>
    </div>
  );
}

function MapMarker({ className }: { className: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="group relative">
        <div className="size-3 rounded-full border-2 border-background bg-foreground shadow-sm transition-transform group-hover:scale-125" />

        <div className="absolute -inset-2 -z-10 rounded-full bg-foreground/5" />
      </div>
    </div>
  );
}

function RecentSearch({
  query,
  results,
  time,
}: {
  query: string;
  results: string;
  time: string;
}) {
  return (
    <Link
      href="/search"
      className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{query}</p>
        <p className="mt-1 text-xs text-muted-foreground">{results}</p>
      </div>

      <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
    </Link>
  );
}

