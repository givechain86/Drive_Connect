import { create } from "zustand";
import type { Application, Message, Notification } from "@/types";
import {
  mockApplications as seedApps,
  mockMessages as seedMsgs,
  mockNotifications as seedNotifs,
  seedDriverRatingsByEmployers,
  seedEmployerRatingsByDrivers,
} from "@/lib/mock-data";
import { aggregateBySubjectId } from "@/lib/rating-aggregate";

type DriverEmployerRating = {
  driver_id: string;
  employer_id: string;
  score: number;
  comment: string | null;
};

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

interface MockEntityState {
  applications: Application[];
  messages: Message[];
  notifications: Notification[];
  driverRatingsByEmployers: DriverEmployerRating[];
  employerRatingsByDrivers: DriverEmployerRating[];
  reset: () => void;
  addApplication: (a: Application) => void;
  updateApplicationStatus: (
    id: string,
    status: Application["status"]
  ) => void;
  addMessage: (m: Message) => void;
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  getDriverRatingAggregates: (
    driverIds: string[]
  ) => Map<string, { avg: number; count: number }>;
  getEmployerRatingAggregates: (
    employerIds: string[]
  ) => Map<string, { avg: number; count: number }>;
  getEmployerRatingOfDriver: (
    employerId: string,
    driverId: string
  ) => { score: number; comment: string | null } | null;
  getDriverRatingOfEmployer: (
    driverId: string,
    employerId: string
  ) => { score: number; comment: string | null } | null;
  upsertEmployerRatesDriver: (input: {
    employerId: string;
    driverId: string;
    score: number;
    comment?: string | null;
  }) => void;
  upsertDriverRatesEmployer: (input: {
    driverId: string;
    employerId: string;
    score: number;
    comment?: string | null;
  }) => void;
}

export const useMockStore = create<MockEntityState>((set, get) => ({
  applications: clone(seedApps),
  messages: clone(seedMsgs),
  notifications: clone(seedNotifs),
  driverRatingsByEmployers: clone(seedDriverRatingsByEmployers),
  employerRatingsByDrivers: clone(seedEmployerRatingsByDrivers),
  reset: () =>
    set({
      applications: clone(seedApps),
      messages: clone(seedMsgs),
      notifications: clone(seedNotifs),
      driverRatingsByEmployers: clone(seedDriverRatingsByEmployers),
      employerRatingsByDrivers: clone(seedEmployerRatingsByDrivers),
    }),
  addApplication: (a) =>
    set({ applications: [...get().applications, a] }),
  updateApplicationStatus: (id, status) => {
    const prev = get().applications.find((a) => a.id === id);
    set({
      applications: get().applications.map((app) =>
        app.id === id ? { ...app, status } : app
      ),
    });
    if (prev) {
      get().addNotification({
        id: `n-status-${Date.now()}`,
        user_id: prev.driver_id,
        type: "application_update",
        title:
          status === "accepted"
            ? "Application accepted"
            : "Application update",
        body:
          status === "accepted"
            ? `You were accepted for ${prev.job?.title ?? "a role"}.`
            : `Update on ${prev.job?.title ?? "your application"}.`,
        read: false,
        meta: { application_id: id, status },
        created_at: new Date().toISOString(),
      });
    }
  },
  addMessage: (m) => set({ messages: [...get().messages, m] }),
  addNotification: (n) =>
    set({ notifications: [n, ...get().notifications] }),
  markNotificationRead: (id) =>
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }),
  getDriverRatingAggregates: (driverIds) => {
    const rows = get().driverRatingsByEmployers.filter((r) =>
      driverIds.includes(r.driver_id)
    );
    const full = aggregateBySubjectId(
      rows.map((r) => ({ driver_id: r.driver_id, score: r.score })),
      "driver_id"
    );
    const out = new Map<string, { avg: number; count: number }>();
    for (const id of driverIds) {
      const v = full.get(id);
      if (v) out.set(id, v);
    }
    return out;
  },
  getEmployerRatingAggregates: (employerIds) => {
    const rows = get().employerRatingsByDrivers.filter((r) =>
      employerIds.includes(r.employer_id)
    );
    const full = aggregateBySubjectId(
      rows.map((r) => ({ employer_id: r.employer_id, score: r.score })),
      "employer_id"
    );
    const out = new Map<string, { avg: number; count: number }>();
    for (const id of employerIds) {
      const v = full.get(id);
      if (v) out.set(id, v);
    }
    return out;
  },
  getEmployerRatingOfDriver: (employerId, driverId) => {
    const r = get().driverRatingsByEmployers.find(
      (x) => x.employer_id === employerId && x.driver_id === driverId
    );
    return r ? { score: r.score, comment: r.comment } : null;
  },
  getDriverRatingOfEmployer: (driverId, employerId) => {
    const r = get().employerRatingsByDrivers.find(
      (x) => x.driver_id === driverId && x.employer_id === employerId
    );
    return r ? { score: r.score, comment: r.comment } : null;
  },
  upsertEmployerRatesDriver: ({ employerId, driverId, score, comment }) => {
    const list = get().driverRatingsByEmployers.filter(
      (x) => !(x.employer_id === employerId && x.driver_id === driverId)
    );
    list.push({
      driver_id: driverId,
      employer_id: employerId,
      score,
      comment: comment ?? null,
    });
    set({ driverRatingsByEmployers: list });
  },
  upsertDriverRatesEmployer: ({ driverId, employerId, score, comment }) => {
    const list = get().employerRatingsByDrivers.filter(
      (x) => !(x.driver_id === driverId && x.employer_id === employerId)
    );
    list.push({
      driver_id: driverId,
      employer_id: employerId,
      score,
      comment: comment ?? null,
    });
    set({ employerRatingsByDrivers: list });
  },
}));
