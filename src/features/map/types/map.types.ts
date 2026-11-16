
export interface MapPlace {
  id: string;
  name: string;
  website: string | null;
  mapUrl: string | null;
  logoUrl: string | null;
  peopleCount: number;
  people: MapPerson[];
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface MapPerson {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
}

export type MapPlacesPage = {
  items: MapPlace[];
  nextCursor: string | null;
  hasMore: boolean;
  center: [number, number];
  city: string | null;
};

export type MapBounds = { north: number; south: number; east: number; west: number };
