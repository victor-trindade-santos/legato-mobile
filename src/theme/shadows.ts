/**
 * LEGATO — Design Tokens: Shadows
 *
 * Em React Native, shadow funciona diferente entre iOS e Android.
 * iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * Android: elevation
 *
 * Valores inspirados nos box-shadows do projeto web.
 *
 * USO: import { Shadows } from '@/theme'
 * Ex:  style={[styles.card, Shadows.md]}
 */

import { Platform } from 'react-native';

const shadow = (
  elevation: number,
  opacity: number,
  radius: number,
  offsetY: number = 2
) => {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
};

export const Shadows = {
  // Sombra mínima — web: 0 1px 3px rgba(0,0,0,0.05)
  xs: shadow(1, 0.05, 2, 1),

  // Sombra sutil — web: 0 2px 6px rgba(0,0,0,0.05)
  sm: shadow(2, 0.08, 4, 2),

  // Sombra padrão — web: 0 4px 12px rgba(0,0,0,0.15)
  md: shadow(4, 0.15, 8, 4),

  // Sombra de card — web: rgba(0,0,0,0.35) 0px 5px 15px
  lg: shadow(8, 0.25, 12, 5),

  // Sombra de modal/bottom sheet — web: 0 10px 25px rgba(0,0,0,0.3)
  xl: shadow(16, 0.30, 20, 8),

  // Sombra com cor primária (efeito glow em botões)
  primary: {
    shadowColor: '#6200D3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;
