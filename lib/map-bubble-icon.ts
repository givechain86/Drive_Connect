import L from "leaflet";

export type BubbleVariant = "driver" | "driver-away" | "job";

const VARIANT_CLASS: Record<BubbleVariant, string> = {
  driver: "dc-bubble--driver",
  "driver-away": "dc-bubble--driver-away",
  job: "dc-bubble--job",
};

/** Short code for bubble (max 4 chars), e.g. initials or city-style abbrev. */
export function bubbleCodeFromName(name: string | null | undefined): string {
  const parts = (name ?? "?").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]!;
    const b = parts[1]!;
    const c = parts[2]?.[0] ?? "";
    return (a[0]! + b[0]! + c).toUpperCase().slice(0, 4);
  }
  return (parts[0] ?? "?").slice(0, 4).toUpperCase();
}

export function bubbleCodeFromJobTitle(title: string): string {
  const cleaned = title.replace(/[^a-zA-Z\s]/g, " ").trim();
  const w = cleaned.split(/\s+/).filter(Boolean);
  if (w.length >= 2) {
    return (w[0]!.slice(0, 2) + w[1]![0]!).toUpperCase().slice(0, 4);
  }
  return cleaned.slice(0, 4).toUpperCase() || "JOB";
}

export function createBubbleIcon(
  code: string,
  variant: BubbleVariant
): L.DivIcon {
  const safe = code
    .replace(/</g, "")
    .replace(/>/g, "")
    .slice(0, 4)
    .toUpperCase();
  const cls = VARIANT_CLASS[variant];
  return L.divIcon({
    className: "dc-bubble-wrap",
    html: `<div class="dc-bubble ${cls}"><span class="dc-bubble__text">${safe}</span></div>`,
    iconSize: [52, 46],
    iconAnchor: [26, 46],
    popupAnchor: [0, -40],
  });
}

/** Carto “Positron” light basemap (minimal, markers pop). */
export const CARTO_LIGHT_TILES =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
