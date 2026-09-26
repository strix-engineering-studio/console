"use client";
import { useQuery } from "@tanstack/react-query";
import { mapService } from "./map.service";
export const mapKeys = { places: ["map", "places"] as const };
export const useMapPlaces = () => useQuery({ queryKey: mapKeys.places, queryFn: mapService.places });
