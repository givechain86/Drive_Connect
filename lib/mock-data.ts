import type {
  Application,
  DriverProfile,
  EmployerProfile,
  Job,
  Message,
  Notification,
  Profile,
} from "@/types";

const now = new Date().toISOString();

export const mockProfiles: Profile[] = [
  {
    id: "mock-driver-1",
    email: "alex.rivera@example.com",
    role: "driver",
    full_name: "Alex Rivera",
    created_at: now,
  },
  {
    id: "mock-driver-2",
    email: "sam.chen@example.com",
    role: "driver",
    full_name: "Sam Chen",
    created_at: now,
  },
  {
    id: "mock-driver-3",
    email: "maria.garcia@example.com",
    role: "driver",
    full_name: "Maria Garcia",
    created_at: now,
  },
  {
    id: "mock-driver-4",
    email: "yusuf.demir@example.com",
    role: "driver",
    full_name: "Yusuf Demir",
    created_at: now,
  },
  {
    id: "mock-driver-5",
    email: "olivia.turner@example.com",
    role: "driver",
    full_name: "Olivia Turner",
    created_at: now,
  },
  {
    id: "mock-employer-1",
    email: "hr@metrohaul.com",
    role: "employer",
    full_name: "Jordan Lee",
    created_at: now,
  },
];

export const mockDriverProfiles: (DriverProfile & { profile: Profile })[] = [
  {
    user_id: "mock-driver-1",
    phone: "+1 555-0101",
    location_name: "Oakland, CA",
    lat: 37.8044,
    lng: -122.2712,
    experience_years: 6,
    license_type: "CDL Class A",
    cdl_class: "A",
    endorsements: ["Hazmat", "Tanker", "Doubles/Triples"],
    miles_driven: 420_000,
    background_check_verified: true,
    willing_to_relocate: false,
    availability_starts_at: null,
    availability: true,
    cv_url: null,
    profile_views: 42,
    profile: mockProfiles[0]!,
  },
  {
    user_id: "mock-driver-2",
    phone: "+1 555-0102",
    location_name: "San Jose, CA",
    lat: 37.3382,
    lng: -121.8863,
    experience_years: 3,
    license_type: "CDL Class B",
    cdl_class: "B",
    endorsements: ["Air brakes"],
    miles_driven: 185_000,
    background_check_verified: true,
    willing_to_relocate: true,
    availability_starts_at: "2026-05-01",
    availability: false,
    cv_url: null,
    profile_views: 18,
    profile: mockProfiles[1]!,
  },
  {
    user_id: "mock-driver-3",
    phone: "+1 555-0103",
    location_name: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    experience_years: 8,
    license_type: "CDL Class A",
    cdl_class: "A",
    endorsements: ["Hazmat", "TWIC"],
    miles_driven: 890_000,
    background_check_verified: true,
    willing_to_relocate: true,
    availability_starts_at: null,
    availability: true,
    cv_url: null,
    profile_views: 57,
    profile: mockProfiles[2]!,
  },
  {
    user_id: "mock-driver-4",
    phone: "+1 555-0104",
    location_name: "Berkeley, CA",
    lat: 37.8715,
    lng: -122.273,
    experience_years: 4,
    license_type: "CDL Class B",
    cdl_class: "B",
    endorsements: ["Tanker", "Passenger"],
    miles_driven: 310_000,
    background_check_verified: false,
    willing_to_relocate: false,
    availability_starts_at: "2026-04-20",
    availability: true,
    cv_url: null,
    profile_views: 23,
    profile: mockProfiles[3]!,
  },
  {
    user_id: "mock-driver-5",
    phone: "+1 555-0105",
    location_name: "Palo Alto, CA",
    lat: 37.4419,
    lng: -122.143,
    experience_years: 2,
    license_type: "Van / Delivery",
    cdl_class: "C",
    endorsements: [],
    miles_driven: 95_000,
    background_check_verified: true,
    willing_to_relocate: true,
    availability_starts_at: null,
    availability: false,
    cv_url: null,
    profile_views: 11,
    profile: mockProfiles[4]!,
  },
];

export const mockEmployerProfiles: (EmployerProfile & { profile: Profile })[] =
  [
    {
      user_id: "mock-employer-1",
      company_name: "MetroHaul Logistics",
      company_description: "Regional freight and last-mile delivery.",
      profile: mockProfiles[5]!,
    },
  ];

export const mockJobs: Job[] = [
  {
    id: "mock-job-1",
    employer_id: "mock-employer-1",
    title: "Regional CDL-A Driver",
    location: "Chicago, IL",
    pay_rate: "$28–32/hr",
    shift: "day",
    description:
      "Dedicated lanes, home most weekends. Hazmat endorsement preferred.",
    created_at: now,
    lat: 41.8781,
    lng: -87.6298,
  },
  {
    id: "mock-job-2",
    employer_id: "mock-employer-1",
    title: "Night Shuttle Driver",
    location: "Milwaukee, WI",
    pay_rate: "$26/hr + night differential",
    shift: "night",
    description: "Airport shuttle fleet. Clean MVR required.",
    created_at: now,
    lat: 43.0389,
    lng: -87.9065,
  },
  {
    id: "mock-job-3",
    employer_id: "mock-employer-1",
    title: "Local Delivery — Class B",
    location: "Chicago, IL",
    pay_rate: "$24/hr",
    shift: "flexible",
    description: "Box truck deliveries in metro area.",
    created_at: now,
    lat: 41.9,
    lng: -87.68,
  },
  {
    id: "mock-job-4",
    employer_id: "mock-employer-1",
    title: "Interstate Long-Haul Driver",
    location: "Dallas, TX",
    pay_rate: "$0.65/mile + per diem",
    shift: "flexible",
    description:
      "48-state routes with modern fleet. 2+ years long-haul experience required.",
    created_at: now,
    lat: 32.7767,
    lng: -96.797,
  },
  {
    id: "mock-job-5",
    employer_id: "mock-employer-1",
    title: "Day Route Refrigerated Truck Driver",
    location: "Denver, CO",
    pay_rate: "$30/hr",
    shift: "day",
    description:
      "Regional refrigerated deliveries. Early start, consistent weekly schedule.",
    created_at: now,
    lat: 39.7392,
    lng: -104.9903,
  },
];

export const mockApplications: Application[] = [
  {
    id: "mock-app-1",
    job_id: "mock-job-1",
    driver_id: "mock-driver-1",
    status: "accepted",
    created_at: now,
    job: mockJobs[0],
  },
  {
    id: "mock-app-2",
    job_id: "mock-job-2",
    driver_id: "mock-driver-2",
    status: "accepted",
    created_at: now,
    job: mockJobs[1],
  },
];

/** Seed mutual ratings for demo (employer ↔ driver, 1–5). */
export const seedDriverRatingsByEmployers: {
  driver_id: string;
  employer_id: string;
  score: number;
  comment: string | null;
}[] = [
  {
    driver_id: "mock-driver-1",
    employer_id: "mock-employer-1",
    score: 5,
    comment: "Reliable and on time.",
  },
  {
    driver_id: "mock-driver-3",
    employer_id: "mock-employer-1",
    score: 4,
    comment: null,
  },
];

export const seedEmployerRatingsByDrivers: {
  driver_id: string;
  employer_id: string;
  score: number;
  comment: string | null;
}[] = [
  {
    driver_id: "mock-driver-1",
    employer_id: "mock-employer-1",
    score: 4,
    comment: "Clear job expectations, fair pay.",
  },
];

export const mockMessages: Message[] = [
  {
    id: "mock-msg-1",
    sender_id: "mock-employer-1",
    receiver_id: "mock-driver-1",
    content:
      "Hi Alex — thanks for applying. Are you available for a phone screen this week?",
    created_at: now,
  },
  {
    id: "mock-msg-2",
    sender_id: "mock-driver-1",
    receiver_id: "mock-employer-1",
    content: "Yes — Tuesday or Wednesday after 2pm works for me.",
    created_at: now,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "mock-notif-1",
    user_id: "mock-driver-1",
    type: "application_update",
    title: "Application viewed",
    body: "MetroHaul opened your application for Regional CDL-A Driver.",
    read: false,
    meta: { job_id: "mock-job-1" },
    created_at: now,
  },
  {
    id: "mock-notif-2",
    user_id: "mock-driver-1",
    type: "new_job",
    title: "New job near you",
    body: "Night Shuttle Driver — Milwaukee, WI",
    read: true,
    meta: { job_id: "mock-job-2" },
    created_at: now,
  },
];
