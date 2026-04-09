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
  profile?: Profile;
}

export interface EmployerProfile {
  user_id: string;
  company_name: string;
  company_description: string | null;
  profile?: Profile;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  location: string;
  pay_rate: string;
  shift: JobShift;
  description: string | null;
  created_at: string;
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
