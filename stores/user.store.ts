"use client";

import { create } from "zustand";
import { getMyProfile } from "@/services/profile.services";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
} | null;

type UserState = {
  profile: Profile;
  loading: boolean;
  loadProfile: () => Promise<void>;
  clear: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  loading: false,
  clear: () => set({ profile: null }),
  loadProfile: async () => {
    set({ loading: true });
    try {
      const p = await getMyProfile();
      set({ profile: p ?? null, loading: false });
    } catch {
      set({ profile: null, loading: false });
    }
  },
}));
