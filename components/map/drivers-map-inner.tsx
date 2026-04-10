"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  bubbleCodeFromJobTitle,
  bubbleCodeFromName,
  CARTO_ATTRIBUTION,
  CARTO_LIGHT_TILES,
  createBubbleIcon,
} from "@/lib/map-bubble-icon";
import { approxCoordsFromLocation } from "@/lib/job-map-coords";
import type { DriverProfile, Job, Profile } from "@/types";

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 1) return;
    if (points.length === 1) {
      map.setView(points[0]!, 9);
      return;
    }
    const b = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(b, { padding: [52, 52], maxZoom: 7 });
  }, [map, points]);
  return null;
}

type Props = {
  drivers: (DriverProfile & { profile: Profile })[];
  jobs: Job[];
  onlyAvailable: boolean;
};

export function DriversMapInner({ drivers, jobs, onlyAvailable }: Props) {
  const filteredDrivers = useMemo(
    () =>
      drivers.filter(
        (d) =>
          d.lat != null &&
          d.lng != null &&
          (!onlyAvailable || d.availability)
      ),
    [drivers, onlyAvailable]
  );

  const jobMarkers = useMemo(() => {
    const out: { job: Job; lat: number; lng: number; approx: boolean }[] = [];
    for (const j of jobs) {
      let lat = j.lat;
      let lng = j.lng;
      let approx = false;
      if (lat == null || lng == null) {
        const a = approxCoordsFromLocation(j.location);
        if (a) {
          lat = a.lat;
          lng = a.lng;
          approx = true;
        }
      }
      if (lat == null || lng == null) continue;
      out.push({ job: j, lat, lng, approx });
    }
    return out;
  }, [jobs]);

  const boundsPoints = useMemo(() => {
    const pts: [number, number][] = [];
    filteredDrivers.forEach((d) =>
      pts.push([d.lat as number, d.lng as number])
    );
    jobMarkers.forEach(({ lat, lng }) => pts.push([lat, lng]));
    return pts;
  }, [filteredDrivers, jobMarkers]);

  const center: [number, number] = useMemo(() => {
    if (!boundsPoints.length) return [39.8283, -98.5795];
    const lat =
      boundsPoints.reduce((s, p) => s + p[0], 0) / boundsPoints.length;
    const lng =
      boundsPoints.reduce((s, p) => s + p[1], 0) / boundsPoints.length;
    return [lat, lng];
  }, [boundsPoints]);

  return (
    <MapContainer
      center={center}
      zoom={boundsPoints.length ? 4 : 4}
      className="z-0 h-[420px] w-full rounded-2xl"
      scrollWheelZoom
    >
      {boundsPoints.length > 0 && <FitBounds points={boundsPoints} />}
      <TileLayer attribution={CARTO_ATTRIBUTION} url={CARTO_LIGHT_TILES} />
      <ZoomControl position="bottomright" />
      {filteredDrivers.map((d) => {
        const code = bubbleCodeFromName(d.profile.full_name);
        const variant = d.availability ? "driver" : "driver-away";
        return (
          <Marker
            key={d.user_id}
            position={[d.lat as number, d.lng as number]}
            icon={createBubbleIcon(code, variant)}
          >
            <Popup>
              <div className="min-w-[200px] py-1 pr-1 text-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Driver
                </p>
                <p className="text-base font-bold leading-tight">
                  {d.profile.full_name ?? "Driver"}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {d.license_type ?? "—"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {d.location_name ?? ""}
                </p>
                <span
                  className={
                    d.availability ? "text-emerald-600" : "text-zinc-500"
                  }
                >
                  {d.availability ? "● Available" : "● Unavailable"}
                </span>
                <Link
                  href={`/drivers/${d.user_id}`}
                  className="mt-2 inline-block text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
                >
                  View profile →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
      {jobMarkers.map(({ job: j, lat, lng, approx }) => {
        const code = bubbleCodeFromJobTitle(j.title);
        return (
          <Marker
            key={j.id}
            position={[lat, lng]}
            icon={createBubbleIcon(code, "job")}
          >
            <Popup>
              <div className="min-w-[200px] py-1 pr-1 text-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                  Open job
                </p>
                <p className="text-base font-bold leading-tight">{j.title}</p>
                <p className="mt-1 text-sm font-medium text-emerald-700">
                  {j.pay_rate}
                </p>
                <p className="text-sm text-zinc-600">{j.location}</p>
                {approx && (
                  <p className="mt-1 text-[10px] leading-snug text-zinc-500">
                    Pin placed from location text (approximate).
                  </p>
                )}
                <Link
                  href={`/jobs/${j.id}`}
                  className="mt-2 inline-block text-sm font-medium text-orange-700 underline-offset-2 hover:underline"
                >
                  View job →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
