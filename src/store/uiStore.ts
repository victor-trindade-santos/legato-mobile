/**
 * LEGATO — UI Store (Zustand)
 *
 * Estado global de interface: tema, loading global.
 *
 * USO:
 *   const { theme, toggleTheme, isGlobalLoading } = useUIStore();
 */

import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface UIState {
  theme: Theme;
  isGlobalLoading: boolean;

  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark', // App começa em dark (conforme TELA_1_INICIAL.png)
  isGlobalLoading: false,

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  setTheme: (theme) => set({ theme }),

  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
}));
