export type CdlClass = "A" | "B" | "C";

/** Prefer explicit `cdl_class`; otherwise infer from legacy `license_type` text. */
export function inferCdlClass(
  licenseType: string | null | undefined,
  explicit: string | null | undefined
): CdlClass | null {
  const e = explicit?.trim().toUpperCase();
  if (e === "A" || e === "B" || e === "C") return e;
  const lic = licenseType?.toUpperCase() ?? "";
  if (lic.includes("CLASS A") || lic.includes("CDL-A") || /\bCDL\s*A\b/.test(lic))
    return "A";
  if (lic.includes("CLASS B") || lic.includes("CDL-B") || /\bCDL\s*B\b/.test(lic))
    return "B";
  if (lic.includes("CLASS C") || lic.includes("CDL-C") || /\bCDL\s*C\b/.test(lic))
    return "C";
  return null;
}

export function formatMiles(miles: number | null | undefined): string {
  if (miles == null || miles < 0 || Number.isNaN(miles)) return "—";
  if (miles >= 1_000_000)
    return `${(miles / 1_000_000).toFixed(miles % 1_000_000 === 0 ? 0 : 1)}M mi`;
  if (miles >= 10_000) return `${Math.round(miles / 1000)}k mi`;
  return `${Math.round(miles).toLocaleString()} mi`;
}

export function formatAvailabilityDate(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
