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
import type { MusicGenre } from '@/constants/genres';

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bannerUrl?: string;
  role: 'USER' | 'ADMIN';
  // Campos de perfil — populados após o onboarding/edição
  bio?: string;
  objective?: string;
  skills?: string[];
  musicGenres?: MusicGenre[];
  sex?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  // Localização estruturada
  city?: string;
  state?: string;
  country?: string;
  // Links sociais
  instagram?: string;
  spotify?: string;
  youtube?: string;
  soundcloud?: string;
  website?: string;
  // Mídia
  photos?: string[];
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
