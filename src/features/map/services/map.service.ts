import { apiRequest } from "@/lib/api/client";
import type { MapPlace } from "../types";

export const mapService = {
  places: (): Promise<MapPlace[]> =>
    apiRequest("/api/map"),
};