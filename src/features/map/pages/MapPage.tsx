"use client";
import { useMapPlaces } from "../services/map.queries";
export default function MapPage() {
  const query = useMapPlaces();
  return (
    <section>
      <p className="text-sm text-muted-foreground">
        Geographic view of organizations linked to leads
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Map</h1>
      <p className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        Interactive mapping is not available until location coordinates and a
        map provider are configured. The list below shows saved organization
        locations.
      </p>
      {query.isPending && (
        <p className="mt-5 text-sm text-muted-foreground">Loading locations…</p>
      )}
      {query.isError && (
        <p role="alert" className="mt-5 text-sm text-destructive">
          {query.error.message}
        </p>
      )}
      {query.data && (
        <div className="mt-5 rounded-xl border">
          {query.data.length ? (
            <ul className="divide-y">
              {query.data.map((place) => (
                <li
                  key={place.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <span className="font-medium">{place.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {[place.city, place.country, place.location]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No organization locations yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
