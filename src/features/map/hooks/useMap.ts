"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { mapService } from "../services/map.service";
import type { MapBounds } from "../types";

export const mapKeys = {
  places: (limit: number, bounds?: MapBounds) => ["map", "places", limit, bounds ?? "default-city"] as const,
};

export const useMapPlaces = (limit = 10, bounds?: MapBounds) =>
  useInfiniteQuery({
    queryKey: mapKeys.places(limit, bounds),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => mapService.places({ limit, cursor: pageParam, bounds }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined,
  });
