import { shouldUseMockData } from "@/lib/config";
import { aggregateBySubjectId } from "@/lib/rating-aggregate";
import { getBrowserClient, resolveBrowserClient } from "@/lib/supabase/client";
import { useMockStore } from "@/store/mock-store";

export async function fetchDriverRatingAggregates(
  driverIds: string[]
): Promise<Map<string, { avg: number; count: number }>> {
  if (driverIds.length === 0) return new Map();
  if (shouldUseMockData()) {
    return useMockStore.getState().getDriverRatingAggregates(driverIds);
  }
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (!sb) return new Map();
  const { data, error } = await sb
    .from("driver_ratings_by_employers")
    .select("driver_id, score")
    .in("driver_id", driverIds);
  if (error || !data) return new Map();
  return aggregateBySubjectId(
    data as { driver_id: string; score: number }[],
    "driver_id"
  );
}

export async function fetchEmployerRatingAggregates(
  employerIds: string[]
): Promise<Map<string, { avg: number; count: number }>> {
  if (employerIds.length === 0) return new Map();
  if (shouldUseMockData()) {
    return useMockStore.getState().getEmployerRatingAggregates(employerIds);
  }
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (!sb) return new Map();
  const { data, error } = await sb
    .from("employer_ratings_by_drivers")
    .select("employer_id, score")
    .in("employer_id", employerIds);
  if (error || !data) return new Map();
  return aggregateBySubjectId(
    data as { employer_id: string; score: number }[],
    "employer_id"
  );
}

export async function fetchMyDriverRatingForDriver(
  employerId: string,
  driverId: string
): Promise<{ score: number; comment: string | null } | null> {
  if (shouldUseMockData()) {
    return useMockStore
      .getState()
      .getEmployerRatingOfDriver(employerId, driverId);
  }
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("driver_ratings_by_employers")
    .select("score, comment")
    .eq("employer_id", employerId)
    .eq("driver_id", driverId)
    .maybeSingle();
  if (error || !data) return null;
  return { score: data.score, comment: data.comment };
}

export async function fetchMyEmployerRatingForEmployer(
  driverId: string,
  employerId: string
): Promise<{ score: number; comment: string | null } | null> {
  if (shouldUseMockData()) {
    return useMockStore
      .getState()
      .getDriverRatingOfEmployer(driverId, employerId);
  }
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from("employer_ratings_by_drivers")
    .select("score, comment")
    .eq("driver_id", driverId)
    .eq("employer_id", employerId)
    .maybeSingle();
  if (error || !data) return null;
  return { score: data.score, comment: data.comment };
}

export async function upsertDriverRatingByEmployer(input: {
  employerId: string;
  driverId: string;
  score: number;
  comment?: string | null;
}): Promise<{ error: string | null }> {
  if (shouldUseMockData()) {
    useMockStore.getState().upsertEmployerRatesDriver(input);
    return { error: null };
  }
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (!sb) return { error: "No client" };
  const { error } = await sb.from("driver_ratings_by_employers").upsert(
    {
      employer_id: input.employerId,
      driver_id: input.driverId,
      score: input.score,
      comment: input.comment ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "driver_id,employer_id" }
  );
  return { error: error?.message ?? null };
}

export async function upsertEmployerRatingByDriver(input: {
  driverId: string;
  employerId: string;
  score: number;
  comment?: string | null;
}): Promise<{ error: string | null }> {
  if (shouldUseMockData()) {
    useMockStore.getState().upsertDriverRatesEmployer(input);
    return { error: null };
  }
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (!sb) return { error: "No client" };
  const { error } = await sb.from("employer_ratings_by_drivers").upsert(
    {
      driver_id: input.driverId,
      employer_id: input.employerId,
      score: input.score,
      comment: input.comment ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "employer_id,driver_id" }
  );
  return { error: error?.message ?? null };
}
