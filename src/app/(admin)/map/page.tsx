"use client";

import dynamic from "next/dynamic";

const MapPage = dynamic(() => import("@/features/map/MapPage"), {
  ssr: false,
});

export default function MapRoutePage() {
  return <MapPage />;
}
