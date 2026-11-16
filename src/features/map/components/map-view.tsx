"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import L from "leaflet";
import { ArrowUpRight } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { MapBounds, MapPlace } from "../types/map.types";

interface MapViewProps {
  places?: MapPlace[] | null;
  center: [number, number];
  onViewportChange: (bounds: MapBounds) => void;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 11;

function hasCoordinates(place: MapPlace): place is MapPlace & { latitude: number; longitude: number } {
  return typeof place.latitude === "number" && Number.isFinite(place.latitude) && place.latitude >= -90 && place.latitude <= 90 &&
    typeof place.longitude === "number" && Number.isFinite(place.longitude) && place.longitude >= -180 && place.longitude <= 180;
}

function createCompanyIcon(place: MapPlace) {
  const container = document.createElement("div");
  container.style.cssText = "position:relative;width:42px;height:42px;border:2px solid white;border-radius:50%;background:#111827;box-shadow:0 2px 8px #0005;display:flex;align-items:center;justify-content:center;overflow:hidden;color:white;font:600 13px/1 system-ui,sans-serif";
  const initials = place.name.split(/[^\p{L}\p{N}]+/u).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
  const fallback = document.createElement("span");
  fallback.textContent = initials;
  container.appendChild(fallback);

  if (place.logoUrl) {
    const image = document.createElement("img");
    image.src = place.logoUrl;
    image.alt = "";
    image.referrerPolicy = "no-referrer";
    image.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:white";
    image.onerror = () => image.remove();
    container.appendChild(image);
  }

  return L.divIcon({ html: container, className: "", iconSize: [42, 42], iconAnchor: [21, 21], popupAnchor: [0, -20] });
}

function ViewportReporter({ onViewportChange }: { onViewportChange: MapViewProps["onViewportChange"] }) {
  const map = useMap();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const report = () => {
      const current = map.getBounds();
      const round = (value: number) => Math.round(value * 1000) / 1000;
      const bounds: MapBounds = {
        north: round(current.getNorth()),
        south: round(current.getSouth()),
        east: round(current.getEast()),
        west: round(current.getWest()),
      };
      clearTimeout(timer);
      timer = setTimeout(() => onViewportChange(bounds), 300);
    };
    map.on("moveend", report);
    report();
    return () => {
      clearTimeout(timer);
      map.off("moveend", report);
    };
  }, [map, onViewportChange]);
  return null;
}

export default function MapView({ places, center, onViewportChange }: MapViewProps) {
  const iconCache = useRef(new Map<string, { signature: string; icon: L.DivIcon }>());
  const markers = useMemo(() => (Array.isArray(places) ? places : []).filter(hasCoordinates).map((place) => {
    const signature = `${place.name}\u0000${place.logoUrl ?? ""}`;
    const cached = iconCache.current.get(place.id);
    if (cached?.signature === signature) return { place, icon: cached.icon };
    const icon = createCompanyIcon(place);
    iconCache.current.set(place.id, { signature, icon });
    return { place, icon };
  }), [places]);

  return (
    <div className="h-[calc(100vh-210px)] min-h-[440px] w-full overflow-hidden rounded-xl border bg-muted">
      <MapContainer center={center ?? DEFAULT_CENTER} zoom={center ? DEFAULT_ZOOM : 5} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ViewportReporter onViewportChange={onViewportChange} />
        {markers.map(({ place, icon }) => (
          <Marker key={place.id} icon={icon} position={[place.latitude, place.longitude]}>
            <Popup minWidth={260} maxWidth={320}>
              <div className="space-y-3 p-1 text-gray-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="font-semibold">{place.name}</p><p className="mt-1 text-xs text-gray-600">{[place.city, place.state, place.country].filter(Boolean).join(", ") || "Location details not recorded"}</p></div>
                  <Link href={`/organizations/${place.id}`} aria-label={`Open ${place.name}`} className="shrink-0 rounded-md border p-1.5 text-gray-700 hover:bg-gray-100"><ArrowUpRight className="size-4"/></Link>
                </div>
                {place.people.length > 0 ? <div className="border-t pt-2"><p className="mb-2 text-xs font-semibold text-gray-600">People ({place.peopleCount})</p><ul className="space-y-2">{place.people.map((person) => <li key={person.id} className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-medium">{person.name}</p>{person.title && <p className="truncate text-xs text-gray-600">{person.title}</p>}{person.email && <p className="truncate text-xs text-gray-600">{person.email}</p>}</div><Link href={`/people/${person.id}`} aria-label={`Open ${person.name}`} className="shrink-0 rounded-md border p-1 text-gray-700 hover:bg-gray-100"><ArrowUpRight className="size-3.5"/></Link></li>)}</ul>{place.peopleCount > place.people.length && <p className="mt-2 text-xs text-gray-600">Showing {place.people.length} of {place.peopleCount}. Open the organization for its full people list.</p>}</div> : <p className="border-t pt-2 text-xs text-gray-600">No people are linked to this organization.</p>}
                <div className="flex flex-wrap gap-3 border-t pt-2 text-xs">{place.mapUrl && <a href={place.mapUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">Google Maps</a>}{place.website && <a href={place.website} target="_blank" rel="noreferrer" className="text-blue-700 underline">Website</a>}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
