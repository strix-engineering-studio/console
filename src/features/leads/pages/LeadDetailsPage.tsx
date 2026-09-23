"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Copy, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLeadQuery } from "../hooks/useLeads";

export default function LeadDetailsPage({ id }: { id: string }) {
  const { data: lead, isLoading, isError } = useLeadQuery(id);

  const copyId = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Lead identifier copied");
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading lead...</div>;
  }

  if (isError || !lead) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">Unable to load this lead.</p>
        <Link href="/leads">
          <Button variant="outline">Back to leads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 p-6">
      <Link href="/leads">
        <Button variant="ghost" className="px-0">
          <ArrowLeft className="size-4" />
          Back to leads
        </Button>
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg border bg-muted/40">
              <Building2 className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{lead.companyName}</h1>
              <p className="text-sm text-muted-foreground">
                {lead.industry ?? "Unspecified industry"} ·{" "}
                {lead.domain ?? "No domain"}
              </p>
            </div>
          </div>
        </div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
          {lead.status}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead identifiers</CardTitle>
            <CardDescription>
              Use these identifiers to track the organizational and personal
              lead records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Organization lead ID", lead.organizationLeadId],
              ["Personal lead ID", lead.personalLeadId],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
              >
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-mono text-sm">{value}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyId(value)}
                  aria-label={`Copy ${label}`}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              {lead.location ?? "Location not provided"}
            </div>
            <p>
              <span className="text-muted-foreground">Employees:</span>{" "}
              {lead.employeeCount ?? "Not provided"}
            </p>
            <p>
              <span className="text-muted-foreground">Priority:</span>{" "}
              {lead.priority}
            </p>
            <p>
              <span className="text-muted-foreground">Source:</span>{" "}
              {lead.source ?? "Not provided"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
