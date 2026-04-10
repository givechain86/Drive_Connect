/**
 * Approximate coordinates for map pins when `jobs.lat` / `jobs.lng` are null.
 * Uses normalized location strings + pattern matching (no external API).
 */

const EXACT: Record<string, [number, number]> = {
  "san francisco, ca": [37.7749, -122.4194],
  "oakland, ca": [37.8044, -122.2712],
  "san jose, ca": [37.3382, -121.8863],
  "los angeles, ca": [34.0522, -118.2437],
  "san diego, ca": [32.7157, -117.1611],
  "sacramento, ca": [38.5816, -121.4944],
  "berkeley, ca": [37.8715, -122.273],
  "palo alto, ca": [37.4419, -122.143],
  "seattle, wa": [47.6062, -122.3321],
  "portland, or": [45.5152, -122.6784],
  "phoenix, az": [33.4484, -112.074],
  "denver, co": [39.7392, -104.9903],
  "dallas, tx": [32.7767, -96.797],
  "austin, tx": [30.2672, -97.7431],
  "houston, tx": [29.7604, -95.3698],
  "chicago, il": [41.8781, -87.6298],
  "milwaukee, wi": [43.0389, -87.9065],
  "detroit, mi": [42.3314, -83.0458],
  "atlanta, ga": [33.749, -84.388],
  "miami, fl": [25.7617, -80.1918],
  "new york, ny": [40.7128, -74.006],
  "brooklyn, ny": [40.6782, -73.9442],
  "boston, ma": [42.3601, -71.0589],
  "philadelphia, pa": [39.9526, -75.1652],
  "washington, dc": [38.9072, -77.0369],
  "nashville, tn": [36.1627, -86.7816],
  "memphis, tn": [35.1495, -90.049],
  "minneapolis, mn": [44.9778, -93.265],
  "kansas city, mo": [39.0997, -94.5786],
  "st. louis, mo": [38.627, -90.1994],
  "las vegas, nv": [36.1699, -115.1398],
  "salt lake city, ut": [40.7608, -111.891],
};

/** Keyword → coords (first match wins). Useful for non-US or informal text. */
const PATTERNS: { re: RegExp; lat: number; lng: number }[] = [
  { re: /\bchicago\b/i, lat: 41.8781, lng: -87.6298 },
  { re: /\bdallas\b/i, lat: 32.7767, lng: -96.797 },
  { re: /\bdetroit\b/i, lat: 42.3314, lng: -83.0458 },
  { re: /bay area|sf bay|silicon valley/i, lat: 37.7749, lng: -122.4194 },
  { re: /istanbul/i, lat: 41.0082, lng: 28.9784 },
  { re: /ankara/i, lat: 39.9334, lng: 32.8597 },
  { re: /izmir/i, lat: 38.4237, lng: 27.1428 },
  { re: /bursa/i, lat: 40.1826, lng: 29.0665 },
  { re: /antalya/i, lat: 36.8969, lng: 30.7133 },
  { re: /london(?!,\s*on)/i, lat: 51.5074, lng: -0.1278 },
  { re: /toronto/i, lat: 43.6532, lng: -79.3832 },
  { re: /vancouver/i, lat: 49.2827, lng: -123.1207 },
  { re: /montreal/i, lat: 45.5017, lng: -73.5673 },
  { re: /mexico city|ciudad de méxico/i, lat: 19.4326, lng: -99.1332 },
];

export function approxCoordsFromLocation(
  location: string | null | undefined
): { lat: number; lng: number } | null {
  if (!location?.trim()) return null;
  const key = location.toLowerCase().replace(/\s+/g, " ").trim();

  if (EXACT[key]) {
    const [lat, lng] = EXACT[key]!;
    return { lat, lng };
  }

  for (const { re, lat, lng } of PATTERNS) {
    if (re.test(key)) return { lat, lng };
  }

  const beforeComma = key.split(",")[0]?.trim() ?? "";
  for (const [k, v] of Object.entries(EXACT)) {
    if (k.startsWith(beforeComma) || beforeComma.startsWith(k.split(",")[0] ?? "")) {
      const [lat, lng] = v;
      return { lat, lng };
    }
  }

  for (const [k, v] of Object.entries(EXACT)) {
    const city = k.split(",")[0]?.trim();
    if (city && key.includes(city)) {
      const [lat, lng] = v;
      return { lat, lng };
    }
  }

  return null;
}

/** True if the job can be shown on the map (DB coords or derivable from `location`). */
export function jobHasMapPin(job: { lat?: number | null; lng?: number | null; location: string }): boolean {
  if (job.lat != null && job.lng != null) return true;
  return approxCoordsFromLocation(job.location) != null;
}
