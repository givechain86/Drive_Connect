import { shouldUseMockData } from "@/lib/config";
import {
  fetchDriverRatingAggregates,
  fetchEmployerRatingAggregates,
} from "@/lib/ratings";
import { getBrowserClient, resolveBrowserClient } from "@/lib/supabase/client";
import {
  mockDriverProfiles,
  mockEmployerProfiles,
  mockJobs,
} from "@/lib/mock-data";
import type {
  Application,
  DriverProfile,
  EmployerDirectoryEntry,
  EmployerProfile,
  Job,
  Message,
  Notification,
  Profile,
} from "@/types";
import { useMockStore } from "@/store/mock-store";

export async function fetchJobs(): Promise<Job[]> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
    const { data, error } = await sb
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Job[];
  }
  if (shouldUseMockData()) return mockJobs;
  return [];
}

export async function fetchJob(id: string): Promise<Job | null> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
    const { data, error } = await sb.from("jobs").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return data as Job;
  }
  if (shouldUseMockData()) {
    return mockJobs.find((j) => j.id === id) ?? null;
  }
  return null;
}

export async function fetchJobsByEmployer(employerId: string): Promise<Job[]> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
    const { data, error } = await sb
      .from("jobs")
      .select("*")
      .eq("employer_id", employerId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Job[];
  }
  if (shouldUseMockData()) {
    return mockJobs.filter((j) => j.employer_id === employerId);
  }
  return [];
}

function buildLocationPreview(locations: string[]): string | null {
  const locs = [...new Set(locations.filter(Boolean))];
  if (locs.length === 0) return null;
  if (locs.length === 1) return locs[0]!;
  return `${locs[0]} · +${locs.length - 1}`;
}

export async function fetchEmployers(): Promise<EmployerDirectoryEntry[]> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
    const { data: emps, error: eErr } = await sb
      .from("employer_profiles")
      .select("*");
    if (eErr || !emps?.length) return [];
    const ids = (emps as EmployerProfile[]).map((e) => e.user_id);

    const { data: jobRows, error: jErr } = await sb
      .from("jobs")
      .select("employer_id,location")
      .in("employer_id", ids);

    const byEmp = new Map<string, string[]>();
    for (const id of ids) byEmp.set(id, []);
    if (!jErr && jobRows) {
      for (const j of jobRows as { employer_id: string; location: string }[]) {
        const list = byEmp.get(j.employer_id) ?? [];
        list.push(j.location);
        byEmp.set(j.employer_id, list);
      }
    }

    const stats = await fetchEmployerRatingAggregates(ids);
    return (emps as EmployerProfile[]).map((row) => {
      const locs = byEmp.get(row.user_id) ?? [];
      const s = stats.get(row.user_id);
      const { profile: _p, ...rest } = row;
      void _p;
      return {
        ...rest,
        open_jobs_count: locs.length,
        location_preview: buildLocationPreview(locs),
        driver_rating_avg: s?.avg ?? null,
        driver_rating_count: s?.count ?? 0,
      } satisfies EmployerDirectoryEntry;
    });
  }
  if (shouldUseMockData()) {
    const stats = await fetchEmployerRatingAggregates(
      mockEmployerProfiles.map((e) => e.user_id)
    );
    return mockEmployerProfiles.map((e) => {
      const jobsOf = mockJobs.filter((j) => j.employer_id === e.user_id);
      const locs = jobsOf.map((j) => j.location);
      const s = stats.get(e.user_id);
      return {
        ...e,
        open_jobs_count: jobsOf.length,
        location_preview: buildLocationPreview(locs),
        driver_rating_avg: s?.avg ?? null,
        driver_rating_count: s?.count ?? 0,
      };
    });
  }
  return [];
}

export async function fetchEmployerDirectoryEntry(
  userId: string
): Promise<EmployerDirectoryEntry | null> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
    const { data: emp, error } = await sb
      .from("employer_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !emp) return null;
    const row = emp as EmployerProfile;
    const { data: jobRows } = await sb
      .from("jobs")
      .select("location")
      .eq("employer_id", userId);
    const locs = (jobRows ?? []).map((j: { location: string }) => j.location);
    const stats = await fetchEmployerRatingAggregates([userId]);
    const s = stats.get(userId);
    const { profile: _p, ...rest } = row;
    void _p;
    return {
      ...rest,
      open_jobs_count: (jobRows ?? []).length,
      location_preview: buildLocationPreview(locs),
      driver_rating_avg: s?.avg ?? null,
      driver_rating_count: s?.count ?? 0,
    };
  }
  if (shouldUseMockData()) {
    const e = mockEmployerProfiles.find((x) => x.user_id === userId);
    if (!e) return null;
    const jobsOf = mockJobs.filter((j) => j.employer_id === userId);
    const locs = jobsOf.map((j) => j.location);
    const stats = await fetchEmployerRatingAggregates([userId]);
    const s = stats.get(userId);
    return {
      ...e,
      open_jobs_count: jobsOf.length,
      location_preview: buildLocationPreview(locs),
      driver_rating_avg: s?.avg ?? null,
      driver_rating_count: s?.count ?? 0,
    };
  }
  return null;
}

export async function fetchDrivers(): Promise<
  (DriverProfile & { profile: Profile })[]
> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
    const { data: drivers, error: dErr } = await sb
      .from("driver_profiles")
      .select("*");
    if (dErr || !drivers?.length) return [];
    const ids = drivers.map((d) => d.user_id);
    const { data: profs, error: pErr } = await sb
      .from("profiles")
      .select("id,email,role,full_name,created_at")
      .in("id", ids)
      .eq("role", "driver");
    if (pErr || !profs) return [];
    const pmap = new Map(profs.map((p) => [p.id, p as Profile]));
    const merged = drivers
      .map((d) => ({
        ...(d as DriverProfile),
        profile: pmap.get(d.user_id)!,
      }))
      .filter((x) => x.profile);
    const stats = await fetchDriverRatingAggregates(merged.map((d) => d.user_id));
    return merged.map((d) => {
      const s = stats.get(d.user_id);
      return {
        ...d,
        employer_rating_avg: s?.avg ?? null,
        employer_rating_count: s?.count ?? 0,
      };
    });
  }
  if (shouldUseMockData()) {
    const stats = await fetchDriverRatingAggregates(
      mockDriverProfiles.map((d) => d.user_id)
    );
    return mockDriverProfiles.map((d) => {
      const s = stats.get(d.user_id);
      return {
        ...d,
        employer_rating_avg: s?.avg ?? null,
        employer_rating_count: s?.count ?? 0,
      };
    });
  }
  return [];
}

export async function fetchDriverProfile(
  userId: string
): Promise<(DriverProfile & { profile: Profile }) | null> {
  const all = await fetchDrivers();
  return all.find((d) => d.user_id === userId) ?? null;
}

export async function fetchMyApplications(
  driverId: string
): Promise<Application[]> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
  const { data, error } = await sb
    .from("applications")
    .select("*, job:jobs(*)")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      ...row,
      job: row.job as Job,
    })) as Application[];
  }
  if (shouldUseMockData()) {
    return useMockStore
      .getState()
      .applications.filter((a) => a.driver_id === driverId);
  }
  return [];
}

export async function fetchEmployerApplications(
  employerId: string
): Promise<Application[]> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
  const { data: jobs } = await sb.from("jobs").select("id").eq("employer_id", employerId);
  if (!jobs?.length) return [];
  const jobIds = jobs.map((j) => j.id);
  const { data, error } = await sb
    .from("applications")
    .select(
      `
      *,
      job:jobs(*),
      driver:profiles!applications_driver_id_fkey(id,full_name,email,role)
    `
    )
    .in("job_id", jobIds)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row: Record<string, unknown>) => {
    const driverRow = row.driver as Profile | null;
    return {
      ...row,
      driver: driverRow
        ? {
            user_id: driverRow.id,
            profile: driverRow,
            phone: null,
            location_name: null,
            lat: null,
            lng: null,
            experience_years: 0,
            license_type: null,
            availability: true,
            cv_url: null,
            profile_views: 0,
          }
        : undefined,
    };
  }) as Application[];
  }
  if (shouldUseMockData()) {
    const myJobIds = new Set(
      mockJobs.filter((j) => j.employer_id === employerId).map((j) => j.id)
    );
    const dmap = new Map(mockDriverProfiles.map((d) => [d.user_id, d]));
    return useMockStore
      .getState()
      .applications.filter((a) => myJobIds.has(a.job_id))
      .map((a) => ({
        ...a,
        driver: dmap.get(a.driver_id),
      })) as Application[];
  }
  return [];
}

export async function fetchNotifications(
  userId: string
): Promise<Notification[]> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as Notification[];
  }
  if (shouldUseMockData()) {
    return useMockStore
      .getState()
      .notifications.filter((n) => n.user_id === userId);
  }
  return [];
}

export async function fetchConversation(
  me: string,
  other: string
): Promise<Message[]> {
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (sb) {
  const { data, error } = await sb
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${me},receiver_id.eq.${other}),and(sender_id.eq.${other},receiver_id.eq.${me})`
    )
    .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data as Message[];
  }
  if (shouldUseMockData()) {
    return useMockStore
      .getState()
      .messages.filter(
        (m) =>
          (m.sender_id === me && m.receiver_id === other) ||
          (m.sender_id === other && m.receiver_id === me)
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  }
  return [];
}

export async function fetchEmployerDisplayNames(
  employerIds: string[]
): Promise<Map<string, string>> {
  const uniq = [...new Set(employerIds)].filter(Boolean);
  if (uniq.length === 0) return new Map();
  if (shouldUseMockData()) {
    const m = new Map<string, string>();
    for (const id of uniq) {
      const e = mockEmployerProfiles.find((x) => x.user_id === id);
      if (e) m.set(id, e.company_name);
    }
    return m;
  }
  await resolveBrowserClient();
  const sb = getBrowserClient();
  if (!sb) return new Map();
  const { data } = await sb
    .from("employer_profiles")
    .select("user_id, company_name")
    .in("user_id", uniq);
  const m = new Map<string, string>();
  for (const row of data ?? []) {
    const r = row as { user_id: string; company_name: string };
    m.set(r.user_id, r.company_name);
  }
  return m;
}

export function getMockEmployerId(): string {
  return "mock-employer-1";
}
