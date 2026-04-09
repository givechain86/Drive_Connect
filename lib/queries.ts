import { shouldUseMockData } from "@/lib/config";
import { getBrowserClient } from "@/lib/supabase/client";
import {
  mockDriverProfiles,
  mockJobs,
} from "@/lib/mock-data";
import type {
  Application,
  DriverProfile,
  Job,
  Message,
  Notification,
  Profile,
} from "@/types";
import { useMockStore } from "@/store/mock-store";

export async function fetchJobs(): Promise<Job[]> {
  if (shouldUseMockData()) return mockJobs;
  const sb = getBrowserClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Job[];
}

export async function fetchJob(id: string): Promise<Job | null> {
  if (shouldUseMockData()) {
    return mockJobs.find((j) => j.id === id) ?? null;
  }
  const sb = getBrowserClient();
  if (!sb) return null;
  const { data, error } = await sb.from("jobs").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Job;
}

export async function fetchDrivers(): Promise<
  (DriverProfile & { profile: Profile })[]
> {
  if (shouldUseMockData()) return mockDriverProfiles;
  const sb = getBrowserClient();
  if (!sb) return [];
  const { data: drivers, error: dErr } = await sb.from("driver_profiles").select("*");
  if (dErr || !drivers?.length) return [];
  const ids = drivers.map((d) => d.user_id);
  const { data: profs, error: pErr } = await sb
    .from("profiles")
    .select("id,email,role,full_name,created_at")
    .in("id", ids)
    .eq("role", "driver");
  if (pErr || !profs) return [];
  const pmap = new Map(profs.map((p) => [p.id, p as Profile]));
  return drivers
    .map((d) => ({
      ...(d as DriverProfile),
      profile: pmap.get(d.user_id)!,
    }))
    .filter((x) => x.profile);
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
  if (shouldUseMockData()) {
    return useMockStore
      .getState()
      .applications.filter((a) => a.driver_id === driverId);
  }
  const sb = getBrowserClient();
  if (!sb) return [];
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

export async function fetchEmployerApplications(
  employerId: string
): Promise<Application[]> {
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
  const sb = getBrowserClient();
  if (!sb) return [];
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

export async function fetchNotifications(
  userId: string
): Promise<Notification[]> {
  if (shouldUseMockData()) {
    return useMockStore
      .getState()
      .notifications.filter((n) => n.user_id === userId);
  }
  const sb = getBrowserClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Notification[];
}

export async function fetchConversation(
  me: string,
  other: string
): Promise<Message[]> {
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
  const sb = getBrowserClient();
  if (!sb) return [];
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

export function getMockEmployerId(): string {
  return "mock-employer-1";
}
