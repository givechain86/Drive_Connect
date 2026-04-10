import { mockDriverProfiles, mockJobs } from "@/lib/mock-data";
import type { Job } from "@/types";

/** Reference point for “miles away” on the landing page (downtown SF). */
export const LANDING_MAP_CENTER = { lat: 37.7749, lng: -122.4194 };

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

/** Great-circle distance in miles. */
export function milesBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ILLUSTRATIVE_RATINGS = [4.9, 4.8, 5.0, 4.7, 4.85];

export type LandingDriverPreview = {
  userId: string;
  fullName: string;
  location: string | null;
  available: boolean;
  rating: number;
  distanceMiles: number;
  topRated: boolean;
};

export function getLandingDriverPreviews(): LandingDriverPreview[] {
  const { lat: clat, lng: clng } = LANDING_MAP_CENTER;
  return mockDriverProfiles.map((d, i) => ({
    userId: d.user_id,
    fullName: d.profile.full_name ?? "Driver",
    location: d.location_name,
    available: d.availability,
    rating: ILLUSTRATIVE_RATINGS[i] ?? 4.8,
    distanceMiles:
      d.lat != null && d.lng != null ?
        Math.round(milesBetween(clat, clng, d.lat, d.lng) * 10) / 10
      : 0,
    topRated: i === 0 || i === 2,
  }));
}

export function getLandingJobPreviews(): Job[] {
  return mockJobs.slice(0, 3);
}

export type LandingMapDriverPin = {
  kind: "driver";
  userId: string;
  lat: number;
  lng: number;
  label: string;
};

export type LandingMapJobPin = {
  kind: "job";
  jobId: string;
  lat: number;
  lng: number;
  label: string;
};

/** Pins for the landing map preview (drivers + sample job locations). */
export function getLandingMapPins(): {
  drivers: LandingMapDriverPin[];
  jobs: LandingMapJobPin[];
} {
  const drivers: LandingMapDriverPin[] = mockDriverProfiles
    .filter((d) => d.lat != null && d.lng != null)
    .map((d) => ({
      kind: "driver" as const,
      userId: d.user_id,
      lat: d.lat as number,
      lng: d.lng as number,
      label: d.profile.full_name ?? "Driver",
    }));

  const jobs: LandingMapJobPin[] = [
    {
      kind: "job",
      jobId: mockJobs[0]?.id ?? "mock-job-1",
      lat: 37.8044,
      lng: -122.2712,
      label: mockJobs[0]?.title ?? "Regional CDL-A",
    },
    {
      kind: "job",
      jobId: mockJobs[1]?.id ?? "mock-job-2",
      lat: 37.78,
      lng: -122.41,
      label: mockJobs[1]?.title ?? "Night shuttle",
    },
    {
      kind: "job",
      jobId: mockJobs[2]?.id ?? "mock-job-3",
      lat: 37.35,
      lng: -121.9,
      label: mockJobs[2]?.title ?? "Local delivery",
    },
  ];

  return { drivers, jobs };
}

export const LANDING_TESTIMONIALS = [
  {
    quote:
      "We filled two routes in under a week. The map + chat flow is exactly what our fleet needed.",
    name: "Priya N.",
    role: "Ops Manager, Bay Area logistics",
    rating: 5,
  },
  {
    quote:
      "Finally a platform that doesn’t feel like a black hole. I saw real jobs and messaged the employer the same day.",
    name: "Marcus T.",
    role: "CDL-A driver",
    rating: 5,
  },
  {
    quote:
      "Ratings and availability upfront saved us hours of screening. Our dispatch team lives on Drivers Job Hub now.",
    name: "Elena R.",
    role: "Hiring lead",
    rating: 5,
  },
] as const;
