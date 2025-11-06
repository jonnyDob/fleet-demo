// src/components/CommuteMap.tsx
"use client";

import dynamic from "next/dynamic";
import type { RouteConfig, Point } from "./LeafletMapInner";

const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
});

// You can tweak these to wherever you like.
const OFFICE: Point = { lat: 43.65107, lng: -79.347015 }; // Downtown-ish Toronto
const HOME: Point = { lat: 43.689, lng: -79.43 }; // "Employee home" somewhere northwest

export type CommuteModeKey = "transit" | "drive" | "carpool" | "bike";

const ROUTES: Record<CommuteModeKey, RouteConfig> = {
  transit: {
    color: "#3b82f6",
    points: [
      HOME,
      { lat: 43.676, lng: -79.42 },
      { lat: 43.664, lng: -79.39 },
      OFFICE,
    ],
  },
  drive: {
    color: "#ef4444",
    points: [
      HOME,
      { lat: 43.682, lng: -79.41 },
      { lat: 43.667, lng: -79.37 },
      OFFICE,
    ],
  },
  carpool: {
    color: "#f97316",
    points: [
      HOME,
      { lat: 43.694, lng: -79.415 },
      { lat: 43.668, lng: -79.38 },
      OFFICE,
    ],
  },
  bike: {
    color: "#22c55e",
    points: [
      HOME,
      { lat: 43.675, lng: -79.41 },
      { lat: 43.661, lng: -79.38 },
      OFFICE,
    ],
  },
};

interface CommuteMapProps {
  mode: CommuteModeKey;
}

export default function CommuteMap({ mode }: CommuteMapProps) {
  const route = ROUTES[mode] ?? ROUTES.transit;

  return (
    <div className="h-64 md:h-72 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
      <LeafletMapInner office={OFFICE} home={HOME} route={route} />
    </div>
  );
}
