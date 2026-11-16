import { apiRequest } from "@/lib/api/client";
import type { MapBounds, MapPlacesPage } from "../types";

export const mapService = {
  places: ({ limit, cursor, bounds }: { limit: number; cursor?: string; bounds?: MapBounds }): Promise<MapPlacesPage> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    if (bounds) {
      params.set("north", String(bounds.north));
      params.set("south", String(bounds.south));
      params.set("east", String(bounds.east));
      params.set("west", String(bounds.west));
    }
    return apiRequest(`/api/map?${params.toString()}`);
  },
};
