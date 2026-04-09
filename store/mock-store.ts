import { create } from "zustand";
import type { Application, Message, Notification } from "@/types";
import {
  mockApplications as seedApps,
  mockMessages as seedMsgs,
  mockNotifications as seedNotifs,
} from "@/lib/mock-data";

interface MockEntityState {
  applications: Application[];
  messages: Message[];
  notifications: Notification[];
  reset: () => void;
  addApplication: (a: Application) => void;
  updateApplicationStatus: (
    id: string,
    status: Application["status"]
  ) => void;
  addMessage: (m: Message) => void;
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export const useMockStore = create<MockEntityState>((set, get) => ({
  applications: clone(seedApps),
  messages: clone(seedMsgs),
  notifications: clone(seedNotifs),
  reset: () =>
    set({
      applications: clone(seedApps),
      messages: clone(seedMsgs),
      notifications: clone(seedNotifs),
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
}));
