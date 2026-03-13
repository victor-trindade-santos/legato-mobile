/**
 * LEGATO — Design Tokens: Spacing
 *
 * Escala baseada em 4px (múltiplos de 4).
 * Adaptada dos valores do projeto web (0.5rem = 8px, 1rem = 16px, etc.)
 *
 * Estratégia de responsividade:
 *  - Paddings/gaps → valores fixos (já funcionam bem com flex/%)
 *  - Alturas de componente, avatares, ícones → scale() (crescem com a tela)
 *  - Logos → scale() (proporcionais à largura)
 *
 * USO: import { Spacing } from '@/theme'
 * Ex:  paddingHorizontal: Spacing.md  →  16
 */

import { scale, vScale } from './scale';

export const Spacing = {
  // ── Escala fixa (paddings, gaps, margens) ─────────────────────────────────
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Aliases semânticos — fixos intencionalmente
  inputPaddingH: 12,
  inputPaddingV: 10,
  cardPadding: 16,
  screenPaddingH: 20,
  screenPaddingV: 24,
  sectionGap: 24,
  itemGap: 12,

  // ── Alturas de componente ─────────────────────────────────────────────────
  // tabBar e header escalam com a altura (layout de tela)
  // botões são FIXOS — touch target deve ser consistente (mín. 44px — HIG/Material)
  tabBarHeight: vScale(64),
  headerHeight: vScale(56),
  buttonHeightSm: 36,
  buttonHeightMd: 44,
  buttonHeightLg: 52,

  // ── Avatares e ícones — scale (crescem com a largura) ────────────────────
  avatarSm: scale(32),
  avatarMd: scale(44),
  avatarLg: scale(64),
  avatarXl: scale(96),
  iconSm: scale(16),
  iconMd: scale(20),
  iconLg: scale(24),
  iconXl: scale(32),
  iconXxl: scale(48),

  // ── Logos e assets de marca — scale ──────────────────────────────────────
  logoSm: scale(80),
  logoMd: scale(120),
  logoLg: scale(160),
  logoXl: scale(200),
  logoXxl: scale(240),
};

export type SpacingKey = keyof typeof Spacing;
