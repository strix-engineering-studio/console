"use client";

import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";

import "leaflet/dist/leaflet.css";

import type { MapPlace } from "../types/map.types";

interface MapViewProps {
  places?: MapPlace[] | null;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function isValidCoordinate(value: number, min: number, max: number): boolean {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function FitBounds({ places }: { places: MapPlace[] }) {
  const map = useMap();

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (places.length === 0) {
      return null;
    }

    return places.map(
      (place) => [place.latitude, place.longitude] as [number, number],
    );
  }, [places]);

  useEffect(() => {
    if (!bounds || places.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (places.length === 1) {
      map.setView([places[0].latitude, places[0].longitude], 12);
      return;
    }

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 12,
    });
  }, [bounds, map, places]);

  return null;
}

export default function MapView({ places }: MapViewProps) {
  const safePlaces = Array.isArray(places) ? places : [];

  const validPlaces = useMemo(
    () =>
      safePlaces.filter(
        (place) =>
          place != null &&
          isValidCoordinate(place.latitude, -90, 90) &&
          isValidCoordinate(place.longitude, -180, 180),
      ),
    [safePlaces],
  );

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-xl border bg-muted">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds places={validPlaces} />

        {validPlaces.map((place) => (
          <CircleMarker
            key={place.id}
            center={[place.latitude, place.longitude]}
            radius={8}
            pathOptions={{
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-44 space-y-1">
                <p className="font-semibold">{place.name}</p>

                {[place.address, place.city, place.state, place.country]
                  .filter(Boolean)
                  .join(", ") && (
                  <p className="text-sm text-gray-600">
                    {[place.address, place.city, place.state, place.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}

                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 underline"
                  >
                    Visit website
                  </a>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
