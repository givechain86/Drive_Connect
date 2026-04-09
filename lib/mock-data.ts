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
    location_name: "Chicago, IL",
    lat: 41.8781,
    lng: -87.6298,
    experience_years: 6,
    license_type: "CDL Class A",
    availability: true,
    cv_url: null,
    profile_views: 42,
    profile: mockProfiles[0]!,
  },
  {
    user_id: "mock-driver-2",
    phone: "+1 555-0102",
    location_name: "Austin, TX",
    lat: 30.2672,
    lng: -97.7431,
    experience_years: 3,
    license_type: "CDL Class B",
    availability: false,
    cv_url: null,
    profile_views: 18,
    profile: mockProfiles[1]!,
  },
];

export const mockEmployerProfiles: (EmployerProfile & { profile: Profile })[] =
  [
    {
      user_id: "mock-employer-1",
      company_name: "MetroHaul Logistics",
      company_description: "Regional freight and last-mile delivery.",
      profile: mockProfiles[2]!,
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
  },
];

export const mockApplications: Application[] = [
  {
    id: "mock-app-1",
    job_id: "mock-job-1",
    driver_id: "mock-driver-1",
    status: "pending",
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
