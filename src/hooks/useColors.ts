/**
 * useColors — Hook de Cores Semânticas
 *
 * Mapeia o tema atual (dark/light) para tokens semânticos de cor.
 * Usar inline nos componentes: não usar StyleSheet.create() para cores,
 * pois StyleSheet roda no carregamento do módulo, não no render.
 *
 * USO:
 *   const colors = useColors();
 *   <View style={{ backgroundColor: colors.background }}>
 */

import { useContext, createContext } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Colors } from '@/theme';

export const ThemeOverrideContext = createContext<'light' | 'dark' | null>(null);

export interface SemanticColors {
  // Fundos
  background: string;
  surface: string;
  surfaceAlt: string;

  // Texto
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Bordas
  border: string;

  // Controles
  switchTrackTrue: string;
  switchTrackFalse: string;
  switchThumb: string;

  // Ícones de settings
  iconDefault: string;
  iconDestructive: string;
}

export const dark: SemanticColors = {
  background: Colors.backgroundDark,
  surface: Colors.surfaceDark,
  surfaceAlt: '#141318',

  textPrimary: Colors.textPrimaryDark,
  textSecondary: Colors.textSecondaryDark,
  textMuted: Colors.textMuted,

  border: Colors.border,

  switchTrackTrue: Colors.primary,
  switchTrackFalse: Colors.grayBorder,
  switchThumb: Colors.primaryHover,

  iconDefault: Colors.textSecondaryDark,
  iconDestructive: Colors.error,
};

export const light: SemanticColors = {
  background: Colors.backgroundLight,
  surface: Colors.surfaceLight,
  surfaceAlt: Colors.surfaceLightAlt,

  textPrimary: Colors.textPrimaryLight,
  textSecondary: Colors.textSecondaryLight,
  textMuted: Colors.textMuted,

  border: Colors.borderLight,

  switchTrackTrue: Colors.primary,
  switchTrackFalse: Colors.grayBorderLight,
  switchThumb: Colors.white,

  iconDefault: Colors.textSecondaryLight,
  iconDestructive: Colors.error,
};

export function useColors(): SemanticColors {
  const override = useContext(ThemeOverrideContext);
  const theme = useUIStore((s) => s.theme);
  const resolved = override ?? theme;
  return resolved === 'dark' ? dark : light;
}
