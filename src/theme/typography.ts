/**
 * LEGATO — Design Tokens: Typography
 *
 * Baseado no projeto web (font-family: Poppins, escalas do globals.css).
 * Em React Native, fontes precisam ser carregadas via expo-font.
 *
 * FontSize usa moderateScale (fator 0.25) para adaptar a diferentes densidades
 * sem crescer desproporcionalmente em tablets.
 *
 * USO: import { Typography } from '@/theme'
 */

import { moderateScale } from './scale';

export const FontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  // Fallback caso Poppins não carregue
  fallback: 'System',
} as const;

export const FontSize = {
  // Equivalentes web → mobile (base 16px no mobile)
  // moderateScale(n, 0.25): escala 25% da diferença — confortável em tablets
  xxs: moderateScale(10, 0.25),  // badges, labels muito pequenos
  xs:  moderateScale(12, 0.25),  // timestamps, captions
  sm:  moderateScale(14, 0.25),  // labels de input, textos auxiliares
  md:  moderateScale(16, 0.25),  // base / body
  lg:  moderateScale(18, 0.25),  // subtítulos, destaques
  xl:  moderateScale(22, 0.25),  // títulos de seção
  xxl: moderateScale(28, 0.25),  // títulos de tela
  display: moderateScale(30, 0.25), // splash, logo
};

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
} as const;

export const LineHeight = {
  tight: 1.2,   // h1 (web)
  snug: 1.3,    // h2/h3 (web)
  normal: 1.5,  // body (web --line-height)
  relaxed: 1.6,
} as const;

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

/** Estilos tipográficos prontos para usar */
export const TextStyles = {
  // Títulos
  displayTitle: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.normal,
    lineHeight: FontSize.display * LineHeight.tight,
    LetterSpacing: LetterSpacing.tight,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xxl * LineHeight.tight,
  },
  subtitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xl * LineHeight.snug,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.lg * LineHeight.snug,
  },

  // Corpo
  body: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.normal,
    lineHeight: FontSize.md * LineHeight.normal,
  },
  bodyMedium: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.md * LineHeight.normal,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.normal,
    lineHeight: FontSize.sm * LineHeight.normal,
  },

  // Auxiliares
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.normal,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * LineHeight.snug,
  },
  overline: {
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.wider,
  },

  // Botões
  buttonLg: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  buttonMd: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  buttonSm: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
  },
} as const;

export const Typography = {
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  LetterSpacing,
  TextStyles,
} as const;
