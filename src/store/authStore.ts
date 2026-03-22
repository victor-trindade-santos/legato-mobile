/**
 * LEGATO — Auth Store (Zustand)
 *
 * Estado global de autenticação.
 * Persiste via expo-secure-store (token) e memory (user info).
 *
 * USO:
 *   const { isAuthenticated, user, setAuth, logout } = useAuthStore();
 */

import { create } from 'zustand';

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;

  setAuth: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  setNeedsOnboarding: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  needsOnboarding: false,

  setAuth: (token, user) =>
    set({ token, user, isAuthenticated: true }),

  setUser: (user) =>
    set({ user }),

  setNeedsOnboarding: (value) =>
    set({ needsOnboarding: value }),

  logout: () =>
    set({ token: null, user: null, isAuthenticated: false, needsOnboarding: false }),
}));
