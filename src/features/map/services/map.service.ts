import { apiRequest } from "@/lib/api/client";
import type { MapPlace } from "../types";
export const mapService = { places: () => apiRequest<MapPlace[]>("/api/map") };
