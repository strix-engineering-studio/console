"use client";

import dynamic from "next/dynamic";

const MapPage = dynamic(() => import("@/features/leads/pages/MapPage"), {
  ssr: false,
});

export default function MapRoutePage() {
  return <MapPage />;
}
