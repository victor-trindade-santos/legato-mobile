/**
 * LEGATO — Design Tokens: Spacing
 *
 * Escala baseada em 4px (múltiplos de 4).
 * Adaptada dos valores do projeto web (0.5rem = 8px, 1rem = 16px, etc.)
 *
 * USO: import { Spacing } from '@/theme'
 * Ex:  paddingHorizontal: Spacing.md  →  16
 */

export const Spacing = {
  none: 0,
  xxs: 2,   // 2px — micro ajuste
  xs: 4,    // 4px — gap mínimo (ícone ao texto)
  sm: 8,    // 8px — espaçamento pequeno (padding de tag, badge)
  md: 16,   // 16px — espaçamento base (padding padrão de card)
  lg: 24,   // 24px — espaçamento grande (seções)
  xl: 32,   // 32px — espaçamento extra (padding de botão full, entre blocos)
  xxl: 48,  // 48px — espaçamento máximo (seções de tela)
  xxxl: 64, // 64px — padding de tela top/bottom

  // Aliases semânticos
  inputPaddingH: 12,  // Padding horizontal de inputs
  inputPaddingV: 10,  // Padding vertical de inputs
  cardPadding: 16,    // Padding interno de cards
  screenPaddingH: 20, // Padding horizontal de telas
  screenPaddingV: 24, // Padding vertical de telas
  sectionGap: 24,     // Gap entre seções
  itemGap: 12,        // Gap entre itens de lista

  // Tamanhos fixos de componentes
  tabBarHeight: 64,
  headerHeight: 56,
  buttonHeightSm: 36,
  buttonHeightMd: 44,
  buttonHeightLg: 52,
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 64,
  avatarXl: 96,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
} as const;

export type SpacingKey = keyof typeof Spacing;
