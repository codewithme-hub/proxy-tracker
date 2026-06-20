import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitializing: boolean; // true while we attempt silent refresh on app load
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  setInitializing: (v: boolean) => void;
  updateUser: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitializing: true,
  setSession: (user, accessToken) => set({ user, accessToken, isInitializing: false }),
  clearSession: () => set({ user: null, accessToken: null, isInitializing: false }),
  setInitializing: (v) => set({ isInitializing: v }),
  updateUser: (patch) =>
    set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user })),
}));
