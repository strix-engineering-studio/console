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

export type MapPlace = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
};

type MapViewProps = {
  places: MapPlace[];
};

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function FitBounds({ places }: MapViewProps) {
  const map = useMap();

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    if (!places.length) {
      return null;
    }

    return places.map((place) => [
      place.latitude,
      place.longitude,
    ]) as LatLngBoundsExpression;
  }, [places]);

  useEffect(() => {
    if (!bounds) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (places.length === 1) {
      map.setView([places[0].latitude, places[0].longitude], 12);

      return;
    }

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 12,
    });
  }, [bounds, map, places]);

  return null;
}

export default function MapView({ places }: MapViewProps) {
  return (
    <div className="h-[600px] w-full overflow-hidden rounded-xl border bg-muted">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds places={places} />

        {places.map((place) => (
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
              <div className="min-w-44">
                <p className="font-semibold">{place.name}</p>

                <p className="mt-1 text-sm text-gray-600">
                  {[place.city, place.country].filter(Boolean).join(", ")}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
