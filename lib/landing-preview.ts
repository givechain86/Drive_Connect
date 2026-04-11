import { mockDriverProfiles, mockJobs } from "@/lib/mock-data";
import type { Job } from "@/types";

/** Reference point for “miles away” on the landing page (downtown SF). */
export const LANDING_MAP_CENTER = { lat: 37.7749, lng: -122.4194 };

/**
 * Curated landing cards: names/locations/availability come from `mockDriverProfiles`;
 * miles and ratings are fixed for a polished marketing preview.
 */
const LANDING_DRIVER_SHOWCASE: {
  distanceMiles: number;
  rating: number;
  topRated: boolean;
}[] = [
  { distanceMiles: 8.3, rating: 4.9, topRated: true },
  { distanceMiles: 42, rating: 4.8, topRated: false },
  { distanceMiles: 0, rating: 5.0, topRated: true },
  { distanceMiles: 10.4, rating: 4.7, topRated: false },
  { distanceMiles: 27.5, rating: 4.8, topRated: false },
];

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
  return mockDriverProfiles.map((d, i) => {
    const s = LANDING_DRIVER_SHOWCASE[i];
    return {
      userId: d.user_id,
      fullName: d.profile.full_name ?? "Driver",
      location: d.location_name,
      available: d.availability,
      rating: s?.rating ?? 4.8,
      distanceMiles: s?.distanceMiles ?? 0,
      topRated: s?.topRated ?? false,
    };
  });
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
