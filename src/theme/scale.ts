/**
 * LEGATO — Design Tokens: Scale (Responsividade)
 *
 * Base de referência: 375px de largura (iPhone 14 / maioria dos Android mid-range).
 *
 * scale(size)
 *   → escala proporcional à largura real do dispositivo.
 *   → usar em: logos, avatares, ícones, alturas de componentes grandes.
 *
 * moderateScale(size, factor?)
 *   → escala parcial (30% por padrão) — evita que textos/elementos fiquem
 *     desproporcionais em tablets ou telas muito pequenas.
 *   → usar em: fontes, bordas, elementos que não devem crescer 1:1.
 *
 * vScale(size)
 *   → escala proporcional à altura real do dispositivo.
 *   → usar em: alturas de card, padding vertical de tela.
 *
 * USO: import { scale, moderateScale, vScale } from '@/theme'
 */

import { Dimensions } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Safe area insets reais do dispositivo (status bar + home indicator)
// initialWindowMetrics é resolvido antes do primeiro render
const _insets = initialWindowMetrics?.insets ?? { top: 0, bottom: 0 };
const SAFE_TOP    = _insets.top;
const SAFE_BOTTOM = _insets.bottom;

const BASE_WIDTH  = 375;
const BASE_HEIGHT = 812;

export const scale = (size: number): number =>
  Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);

export const vScale = (size: number): number =>
  Math.round((SCREEN_HEIGHT / BASE_HEIGHT) * size);

export const moderateScale = (size: number, factor = 0.3): number =>
  Math.round(size + (scale(size) - size) * factor);

/** Largura e altura reais — uso pontual em componentes */
export const Screen = {
  width:  SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} as const;

/**
 * Layout — constantes responsivas globais
 *
 * Centraliza decisões de layout para que componentes não precisem
 * calcular Dimensions.get('window') individualmente.
 *
 * isTablet       → true quando largura ≥ 600px (tablet/iPad/Surface)
 * cardHeight     → altura ideal para cards de conteúdo principal
 *                  desconta header (56) + tabbar (64) + controles (50) + hint (40)
 *                  limitada a 620px em tablets para não ficar desproporcional
 * cardMaxWidth   → largura máxima de card em tablet (centralizado)
 * contentMaxWidth→ largura máxima de área de conteúdo em tablet
 */
// Altura útil real: desconta safe areas, header, tabbar, row de controles e hint
const USABLE_HEIGHT = SCREEN_HEIGHT - SAFE_TOP - SAFE_BOTTOM - 56 - 64 - 50 - 40;

export const isTablet = SCREEN_WIDTH >= 600;

export const Layout = {
  isTablet,
  cardHeight:      Math.round(isTablet ? Math.min(USABLE_HEIGHT * 0.80, 620) : USABLE_HEIGHT * 0.82),
  cardMaxWidth:    isTablet ? 460 : undefined,
  contentMaxWidth: isTablet ? 600 : undefined,
} as const;
