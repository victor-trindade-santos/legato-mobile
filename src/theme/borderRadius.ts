/**
 * LEGATO — Design Tokens: Border Radius
 *
 * Valores extraídos do CSS do projeto web.
 *
 * USO: import { BorderRadius } from '@/theme'
 */

export const BorderRadius = {
  none: 0,
  xs: 3,    // Badges, tags (web: 3px)
  sm: 6,    // Inputs (web: 6px)
  md: 8,    // Botões, search bars (web: 8px)
  lg: 12,   // Cards de post, cards padrão (web: 12px)
  xl: 16,   // Cards de colaboração, cards grandes (web: 16px)
  xxl: 24,  // Bottom sheets, modais grandes
  pill: 999, // Botões pill, toggle, avatares circulares (web: 50px / 50%)
} as const;

export type BorderRadiusKey = keyof typeof BorderRadius;
