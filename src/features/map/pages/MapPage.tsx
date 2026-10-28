"use client";

import { useMemo } from "react";
import { useMapPlaces } from "../hooks/useMap";

export default function MapPage() {
  const query = useMapPlaces();

  const cities = useMemo(() => {
    const organizations = Array.isArray(query.data) ? query.data : [];

    return organizations.reduce<Record<string, typeof organizations>>(
      (groups, organization) => {
        const city = organization.city?.trim();

        if (!city) return groups;

        const key = [
          city,
          organization.state ?? "",
          organization.country ?? "",
        ].join("|");

        groups[key] ??= [];
        groups[key].push(organization);

        return groups;
      },
      {},
    );
  }, [query.data]);

  return (
    <section>
      <p className="text-sm text-muted-foreground">
        Organizations grouped by city
      </p>

      <h1 className="mt-1 text-3xl font-semibold">Locations</h1>

      {query.isPending && (
        <div className="mt-6 rounded-xl border p-6 text-sm text-muted-foreground">
          Loading organizations…
        </div>
      )}

      {query.isError && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          {query.error.message}
        </p>
      )}

      {query.isSuccess && Object.keys(cities).length === 0 && (
        <div className="mt-6 rounded-xl border p-8 text-center">
          <p className="font-medium">No organizations to display.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Organizations need a website and city to appear here.
          </p>
        </div>
      )}

      {query.isSuccess && Object.entries(cities).length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(cities).map(([key, organizations]) => {
            const first = organizations[0];

            return (
              <div key={key} className="rounded-xl border p-4">
                <div className="mb-4">
                  <h2 className="font-semibold">{first.city}</h2>
                  <p className="text-sm text-muted-foreground">
                    {[first.state, first.country].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {organizations.length}{" "}
                    {organizations.length === 1
                      ? "organization"
                      : "organizations"}
                  </p>
                </div>

                <div className="space-y-3">
                  {organizations.map((organization) => (
                    <div key={organization.id} className="border-t pt-3">
                      <p className="font-medium">{organization.name}</p>

                      {organization.website && (
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block break-all text-sm text-blue-600 underline"
                        >
                          Visit website
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
