"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { DriverProfile, Profile } from "@/types";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  drivers: (DriverProfile & { profile: Profile })[];
  onlyAvailable: boolean;
};

export function DriversMapInner({ drivers, onlyAvailable }: Props) {
  const filtered = useMemo(
    () =>
      drivers.filter(
        (d) =>
          d.lat != null &&
          d.lng != null &&
          (!onlyAvailable || d.availability)
      ),
    [drivers, onlyAvailable]
  );

  const center: [number, number] = useMemo(() => {
    if (!filtered.length) return [39.8283, -98.5795];
    const lat =
      filtered.reduce((s, d) => s + (d.lat as number), 0) / filtered.length;
    const lng =
      filtered.reduce((s, d) => s + (d.lng as number), 0) / filtered.length;
    return [lat, lng];
  }, [filtered]);

  return (
    <MapContainer
      center={center}
      zoom={filtered.length ? 5 : 4}
      className="h-[420px] w-full z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filtered.map((d) => (
        <Marker
          key={d.user_id}
          position={[d.lat as number, d.lng as number]}
          icon={defaultIcon}
        >
          <Popup>
            <strong>{d.profile.full_name ?? "Driver"}</strong>
            <br />
            {d.license_type ?? "—"}
            <br />
            <span className={d.availability ? "text-green-600" : "text-gray-500"}>
              {d.availability ? "Available" : "Unavailable"}
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
