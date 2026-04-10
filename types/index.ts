export type UserRole = "driver" | "employer";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type JobShift = "day" | "night" | "flexible";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at?: string;
}

/** Average 1–5 from employers who rated this driver (shown on cards). */
export interface DriverRatingSummary {
  employer_rating_avg: number | null;
  employer_rating_count: number;
}

export interface DriverProfile {
  user_id: string;
  phone: string | null;
  location_name: string | null;
  lat: number | null;
  lng: number | null;
  experience_years: number;
  license_type: string | null;
  availability: boolean;
  cv_url: string | null;
  profile_views: number;
  /** CDL class for cards and matching (A / B / C). */
  cdl_class?: string | null;
  /** e.g. Hazmat, Tanker — stored as text[] in Postgres. */
  endorsements?: string[] | null;
  /** Lifetime miles driven (approx.). */
  miles_driven?: number | null;
  background_check_verified?: boolean;
  willing_to_relocate?: boolean;
  /** First day available for new work (date-only ISO). */
  availability_starts_at?: string | null;
  profile?: Profile;
  employer_rating_avg?: number | null;
  employer_rating_count?: number;
}

export interface EmployerProfile {
  user_id: string;
  company_name: string;
  company_description: string | null;
  profile?: Profile;
  /** Average 1–5 from drivers who rated this employer */
  driver_rating_avg?: number | null;
  driver_rating_count?: number;
}

/** Public employer row for directory cards (jobs + locations derived from listings). */
export type EmployerDirectoryEntry = EmployerProfile & {
  open_jobs_count: number;
  location_preview: string | null;
  profile?: Profile | null;
};

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  location: string;
  pay_rate: string;
  shift: JobShift;
  description: string | null;
  created_at: string;
  /** Optional map coordinates (mock or future DB columns). */
  lat?: number | null;
  lng?: number | null;
  employer?: EmployerProfile & { profile?: Profile };
}

export interface Application {
  id: string;
  job_id: string;
  driver_id: string;
  status: ApplicationStatus;
  created_at: string;
  job?: Job;
  driver?: DriverProfile & { profile?: Profile };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  meta: Record<string, unknown>;
  created_at: string;
}
