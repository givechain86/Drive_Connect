"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import {
  bubbleCodeFromJobTitle,
  bubbleCodeFromName,
  CARTO_ATTRIBUTION,
  CARTO_LIGHT_TILES,
  createBubbleIcon,
} from "@/lib/map-bubble-icon";
import type { LandingMapDriverPin, LandingMapJobPin } from "@/lib/landing-preview";
import { LANDING_MAP_CENTER } from "@/lib/landing-preview";

type Props = {
  drivers: LandingMapDriverPin[];
  jobs: LandingMapJobPin[];
};

export function MapPreviewInner({ drivers, jobs }: Props) {
  const center: [number, number] = useMemo(
    () => [LANDING_MAP_CENTER.lat, LANDING_MAP_CENTER.lng],
    []
  );

  return (
    <MapContainer
      center={center}
      zoom={9}
      className="landing-map-preview z-0 h-[min(320px,55vh)] w-full min-h-[240px]"
      scrollWheelZoom={false}
      dragging
    >
      <TileLayer attribution={CARTO_ATTRIBUTION} url={CARTO_LIGHT_TILES} />
      <ZoomControl position="bottomright" />
      {drivers.map((d, i) => (
        <Marker
          key={`d-${i}`}
          position={[d.lat, d.lng]}
          icon={createBubbleIcon(bubbleCodeFromName(d.label), "driver")}
        >
          <Popup>
            <div className="min-w-[180px] py-1 text-zinc-900">
              <p className="text-xs font-semibold uppercase text-emerald-700">
                Driver
              </p>
              <p className="font-bold">{d.label}</p>
              <Link
                href={`/drivers/${d.userId}`}
                className="mt-1 inline-block text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
              >
                View profile →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {jobs.map((j, i) => (
        <Marker
          key={`j-${i}`}
          position={[j.lat, j.lng]}
          icon={createBubbleIcon(bubbleCodeFromJobTitle(j.label), "job")}
        >
          <Popup>
            <div className="min-w-[180px] py-1 text-zinc-900">
              <p className="text-xs font-semibold uppercase text-orange-700">
                Job
              </p>
              <p className="font-bold">{j.label}</p>
              <Link
                href={`/jobs/${j.jobId}`}
                className="mt-1 inline-block text-sm font-medium text-orange-700 underline-offset-2 hover:underline"
              >
                View job →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
