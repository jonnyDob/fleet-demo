// src/components/LeafletMapInner.tsx
"use client";

import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export interface Point {
  lat: number;
  lng: number;
}

export interface RouteConfig {
  color: string;
  points: Point[];
}

interface LeafletMapInnerProps {
  office: Point;
  home: Point;
  route: RouteConfig;
}

export default function LeafletMapInner({
  office,
  home,
  route,
}: LeafletMapInnerProps) {
  const center: LatLngExpression = [
    (office.lat + home.lat) / 2,
    (office.lng + home.lng) / 2,
  ];

  const linePositions: LatLngExpression[] = route.points.map((p) => [
    p.lat,
    p.lng,
  ]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {/* Home marker */}
      <CircleMarker
        center={[home.lat, home.lng]}
        radius={7}
        pathOptions={{
          color: "#0ea5e9",
          fillColor: "#0ea5e9",
          fillOpacity: 0.9,
        }}
      />
      {/* Office marker */}
      <CircleMarker
        center={[office.lat, office.lng]}
        radius={7}
        pathOptions={{
          color: "#22c55e",
          fillColor: "#22c55e",
          fillOpacity: 0.9,
        }}
      />
      {/* Route line */}
      <Polyline
        positions={linePositions}
        pathOptions={{ color: route.color, weight: 5, opacity: 0.85 }}
      />
    </MapContainer>
  );
}
