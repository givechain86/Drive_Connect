import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import type { Profile, UserRole } from "@/types";
import { mockProfiles } from "@/lib/mock-data";

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  initialized: boolean;
  mockMode: boolean;
  setSession: (user: User | null, profile: Profile | null, mockMode: boolean) => void;
  setMockPersona: (role: UserRole) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  initialized: false,
  mockMode: false,
  setSession: (user, profile, mockMode) =>
    set({ user, profile, initialized: true, mockMode }),
  setMockPersona: (role) => {
    const p = mockProfiles.find((x) => x.role === role);
    if (!p) return;
    set({
      user: {
        id: p.id,
        email: p.email,
        app_metadata: {},
        user_metadata: {},
        aud: "mock",
        created_at: new Date().toISOString(),
      } as User,
      profile: p,
      initialized: true,
      mockMode: true,
    });
  },
  clearSession: () =>
    set({
      user: null,
      profile: null,
      initialized: true,
      mockMode: false,
    }),
}));
