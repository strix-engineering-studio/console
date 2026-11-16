import "server-only";

import { prisma } from "@/lib/prisma";
import type { MapBounds, MapPlace } from "../types";

const organizationLocationWhere = { OR: [{ website: { not: null } }, { discoveryUrl: { not: null } }, { research: { some: { data: { not: null } } } }] };
let locationIndex: { createdAt: number; promise: Promise<MapPlace[]> } | undefined;

function coordinatePair(value: string): [number, number] | null {
  const patterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return validateCoordinates(Number(match[1]), Number(match[2]));
  }
  try {
    const url = new URL(value);
    for (const key of ["ll", "q", "query", "center"]) {
      const match = url.searchParams.get(key)?.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
      if (match) return validateCoordinates(Number(match[1]), Number(match[2]));
    }
  } catch {
    return null;
  }
  return null;
}

function validateCoordinates(latitude: number, longitude: number): [number, number] | null {
  return Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    ? [latitude, longitude]
    : null;
}

function coordinatesFromData(value: unknown): [number, number] | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = coordinatesFromData(item);
      if (found) return found;
    }
    return null;
  }
  const record = value as Record<string, unknown>;
  const rawLatitude = record.latitude ?? record.lat;
  const rawLongitude = record.longitude ?? record.lng ?? record.lon;
  if (rawLatitude === undefined || rawLatitude === null || rawLatitude === "" || rawLongitude === undefined || rawLongitude === null || rawLongitude === "") return nestedCoordinates(record);
  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const found = validateCoordinates(latitude, longitude);
    if (found) return found;
  }
  return nestedCoordinates(record);
}

function nestedCoordinates(record: Record<string, unknown>): [number, number] | null {
  for (const item of Object.values(record)) {
    const found = coordinatesFromData(item);
    if (found) return found;
  }
  return null;
}

function logoFromData(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = logoFromData(item);
      if (found) return found;
    }
    return null;
  }
  const record = value as Record<string, unknown>;
  for (const key of ["logoUrl", "logo_url", "companyLogo", "company_logo", "logo"]) {
    const candidate = record[key];
    if (typeof candidate === "string") {
      try {
        const url = new URL(candidate);
        if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
      } catch { /* Ignore non-URL logo values. */ }
    }
  }
  for (const item of Object.values(record)) {
    const found = logoFromData(item);
    if (found) return found;
  }
  return null;
}

function isGoogleMapsUrl(value?: string | null) {
  if (!value) return false;
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "maps.google.com" || host === "www.google.com" && value.toLowerCase().includes("/maps") ||
      host === "google.com" && value.toLowerCase().includes("/maps") || host === "maps.app.goo.gl" ||
      host === "goo.gl" && value.toLowerCase().includes("/maps");
  } catch {
    return false;
  }
}

function toMapPlace(row: {
  id: string; name: string; website: string | null; discoveryUrl: string | null;
  address: string | null; city: string | null; state: string | null; country: string | null; postalCode: string | null;
  research: { data: unknown }[];
}): MapPlace | null {
  const mapUrls = [row.discoveryUrl, row.website].filter((url): url is string => isGoogleMapsUrl(url));
  const mapUrl = mapUrls[0] ?? null;
  const coords = coordinatesFor(row);
  if (!coords) return null;
  return {
    id: row.id,
    name: row.name,
    website: row.website && !isGoogleMapsUrl(row.website) ? row.website : null,
    mapUrl,
    logoUrl: row.research.map((run) => logoFromData(run.data)).find(Boolean) ?? null,
    peopleCount: 0,
    people: [],
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    postalCode: row.postalCode,
    latitude: coords?.[0] ?? null,
    longitude: coords?.[1] ?? null,
  };
}

function coordinatesFor(row: { website?: string | null; discoveryUrl?: string | null; research?: { data: unknown }[] }) {
  const mapUrls = [row.discoveryUrl, row.website].filter((url): url is string => isGoogleMapsUrl(url));
  return mapUrls.map(coordinatePair).find(Boolean) ?? row.research?.map((run) => coordinatesFromData(run.data)).find(Boolean) ?? null;
}

async function defaultLocation() {
  const candidates = await getLocationIndex();
    const cities = new Map<string, { city: string; lat: number; lng: number; count: number }>();
    let firstLocation: [number, number] | null = null;
    for (const row of candidates) {
      const coords: [number, number] = [row.latitude!, row.longitude!];
      firstLocation ??= coords;
      const city = row.city?.trim();
      if (!city) continue;
      const key = city.toLocaleLowerCase("en");
      const current = cities.get(key) ?? { city, lat: 0, lng: 0, count: 0 };
      current.lat += coords[0];
      current.lng += coords[1];
      current.count += 1;
      cities.set(key, current);
    }
    const topCity = [...cities.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))[0];
    if (topCity) return { city: topCity.city, center: [topCity.lat / topCity.count, topCity.lng / topCity.count] as [number, number] };
    return { city: null, center: firstLocation ?? [20.5937, 78.9629] };
}

async function getLocationIndex() {
  if (locationIndex && Date.now() - locationIndex.createdAt < 60_000) return locationIndex.promise;
  const promise = prisma.organization.findMany({
    where: organizationLocationWhere,
    select: { id: true, name: true, website: true, discoveryUrl: true, address: true, city: true, state: true, country: true, postalCode: true, research: { take: 5, orderBy: { createdAt: "desc" }, select: { data: true } } },
    orderBy: { id: "asc" },
  }).then((rows) => rows.map(toMapPlace).filter((place): place is MapPlace => place !== null));
  locationIndex = { createdAt: Date.now(), promise };
  try {
    return await promise;
  } catch (error) {
    locationIndex = undefined;
    throw error;
  }
}

function isInsideBounds(latitude: number, longitude: number, bounds: MapBounds) {
  const inLongitude = bounds.west <= bounds.east
    ? longitude >= bounds.west && longitude <= bounds.east
    : longitude >= bounds.west || longitude <= bounds.east;
  return latitude >= bounds.south && latitude <= bounds.north && inLongitude;
}

export const mapRepository = {
  places: async ({ cursor, limit, bounds }: { cursor?: string; limit: number; bounds?: MapBounds }) => {
    const pageSize = Math.max(Math.trunc(limit), 10);
    const defaultView = await defaultLocation();
    const candidates = await getLocationIndex();
    const viewRows = candidates.filter((place) => bounds
      ? isInsideBounds(place.latitude!, place.longitude!, bounds)
      : !defaultView.city || place.city?.trim().toLocaleLowerCase("en") === defaultView.city.trim().toLocaleLowerCase("en"));
    const afterCursor = viewRows.filter((place) => !cursor || place.id > cursor);
    const selected = afterCursor.slice(0, pageSize);
    const details = selected.length ? await prisma.organization.findMany({
      where: { id: { in: selected.map((place) => place.id) } },
      select: {
        id: true,
        people: { take: 6, orderBy: { updatedAt: "desc" }, select: { id: true, name: true, title: true, email: true, phone: true } },
        _count: { select: { people: true } },
      },
    }) : [];
    const detailById = new Map(details.map((record) => [record.id, record]));
    const items = selected.map((place) => {
      const detail = detailById.get(place.id);
      return { ...place, peopleCount: detail?._count.people ?? 0, people: detail?.people ?? [] };
    });
    const hasMore = afterCursor.length > selected.length;
    const nextCursor = hasMore && selected.length ? selected[selected.length - 1].id : null;
    return { items, nextCursor, hasMore, ...defaultView };
  },
};
