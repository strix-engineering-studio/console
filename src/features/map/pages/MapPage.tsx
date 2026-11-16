"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMapPlaces } from "../hooks/useMap";
import type { MapBounds, MapPlace } from "../types";

const MapView = dynamic(() => import("../components/map-view"), {
  ssr: false,
  loading: () => <div className="flex h-[calc(100vh-210px)] min-h-[440px] items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">Loading OpenStreetMap…</div>,
});

export default function MapPage() {
  const [bounds, setBounds] = useState<MapBounds>();
  const [loadedPlaces, setLoadedPlaces] = useState<Map<string, MapPlace>>(() => new Map());
  const [initialView, setInitialView] = useState<{ center: [number, number]; city: string | null }>();
  const query = useMapPlaces(10, bounds);
  const onViewportChange = useCallback((next: MapBounds) => {
    setBounds((current) => current && current.north === next.north && current.south === next.south && current.east === next.east && current.west === next.west ? current : next);
  }, []);

  useEffect(() => {
    const firstPage = query.data?.pages[0];
    if (firstPage) {
      setInitialView((current) => current ?? { center: firstPage.center, city: firstPage.city });
    }
    const places = query.data?.pages.flatMap((page) => page.items) ?? [];
    if (places.length) {
      setLoadedPlaces((current) => {
        const next = new Map(current);
        for (const place of places) next.set(place.id, place);
        return next;
      });
    }
  }, [query.data]);

  const places = useMemo(() => [...loadedPlaces.values()], [loadedPlaces]);
  const visiblePlaces = useMemo(() => {
    if (!bounds) return places;
    return places.filter((place) => {
      if (place.latitude === null || place.longitude === null) return false;
      const inLongitude = bounds.west <= bounds.east
        ? place.longitude >= bounds.west && place.longitude <= bounds.east
        : place.longitude >= bounds.west || place.longitude <= bounds.east;
      return place.latitude >= bounds.south && place.latitude <= bounds.north && inLongitude;
    });
  }, [bounds, places]);

  return (
    <section>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Company locations on OpenStreetMap{initialView?.city ? ` · centered on ${initialView.city}` : ""}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Locations</h1>
          <p className="mt-1 text-xs text-muted-foreground">{places.length} unique companies loaded · fetches 10 more at a time as the map moves</p>
        </div>
      </header>

      {query.isError && <div role="alert" className="mb-3 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{query.error.message}<button onClick={() => void query.refetch()} className="ml-3 underline">Retry</button></div>}
      {query.isPending && <div className="mb-3 h-10 animate-pulse rounded-lg bg-muted"/>}
      {!initialView ? <div className="flex h-[calc(100vh-210px)] min-h-[440px] items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">Finding the city with the most saved map locations…</div> : <MapView places={visiblePlaces} center={initialView.center} onViewportChange={onViewportChange}/>}

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">New viewport results are added once; previously loaded companies are not duplicated.</p>
        <button onClick={() => void query.fetchNextPage()} disabled={!query.hasNextPage || query.isFetchingNextPage} className="shrink-0 rounded-lg border bg-card px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">{query.isFetchingNextPage ? "Loading…" : query.hasNextPage ? "Load 10 more here" : "No more locations here"}</button>
      </div>
    </section>
  );
}
