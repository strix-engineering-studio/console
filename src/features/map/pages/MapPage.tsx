"use client";

import dynamic from "next/dynamic";

import { useMapPlaces } from "../services/map.queries";

const MapView = dynamic(() => import("../components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-xl border bg-muted">
      <p className="text-sm text-muted-foreground">Loading map…</p>
    </div>
  ),
});

export default function MapPage() {
  const query = useMapPlaces();

  return (
    <section>
      <p className="text-sm text-muted-foreground">
        Geographic view of organizations linked to leads
      </p>

      <h1 className="mt-1 text-3xl font-semibold">Map</h1>

      {query.isPending && (
        <div className="mt-6 flex h-[600px] items-center justify-center rounded-xl border">
          <p className="text-sm text-muted-foreground">Loading locations…</p>
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

      {query.data && query.data.length === 0 && (
        <div className="mt-6 flex h-[400px] flex-col items-center justify-center rounded-xl border">
          <p className="font-medium">No organization locations yet.</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Add latitude and longitude coordinates to organizations to display
            them on the map.
          </p>
        </div>
      )}

      {query.data && query.data.length > 0 && (
        <div className="mt-6">
          <MapView places={query.data} />
        </div>
      )}
    </section>
  );
}
