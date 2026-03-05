/**
 * LEGATO — Design Tokens: Colors
 *
 * Extraídos do projeto web (globals.css) e adaptados para mobile.
 * Paleta dark é a principal do app (conforme TELA_1_INICIAL.png).
 *
 * USO: import { Colors } from '@/theme'
 */

export const Colors = {
  // ─── Primary Brand ───────────────────────────────────────────────
  primary: '#6200D3',        // Roxo principal (light mode / botões)
  primaryHover: '#5000B0',   // Roxo hover (mais escuro)
  primaryLight: '#9B59B6',   // Roxo claro (tags, badges leves)
  primaryMuted: 'rgba(98, 0, 211, 0.1)', // Fundo de notificação não lida
  primaryFocus: 'rgba(107, 70, 193, 0.2)', // Anel de foco em inputs

  // ─── Dark Mode Primary ────────────────────────────────────────────
  // Em dark mode o projeto web usa magenta — mantemos o roxo no mobile
  // para consistência com a TELA_1 (Splash usa roxo vibrante)
  primaryDark: '#7B2FBE',    // Roxo vibrante (dark mode / logo / CTA)

  // ─── Background ──────────────────────────────────────────────────
  backgroundDark: '#0E0F12',  // Fundo principal dark (var --background dark)
  backgroundLight: '#FAFAFA', // Fundo principal light (var --background light)

  // ─── Surface / Cards ─────────────────────────────────────────────
  surfaceDark: '#1B1825',    // Fundo de cards dark (var --secondary-color dark)
  surfaceLight: '#FFFFFF',   // Fundo de cards light (var --secondary-color light)
  surfaceLightAlt: '#F5F5F5', // Variante light mais neutra

  // ─── Text ─────────────────────────────────────────────────────────
  textPrimaryDark: '#FFFFFF',  // Texto principal dark
  textPrimaryLight: '#000000', // Texto principal light
  textSecondaryDark: '#A0A0A0', // Texto secundário dark (var --secondary-text-color)
  textSecondaryLight: '#202020', // Texto secundário light
  textMuted: '#888888',          // Texto muito suave (timestamps, labels)
  textSubtext: '#C9C9C9',        // Subtext em dark (var --card-subtext dark)
  textLink: '#7C3AED',           // Links e destaques (violet)

  // ─── Status ───────────────────────────────────────────────────────
  error: '#E11D48',     // Erro / Deletar (red-600)
  errorLight: 'rgba(225, 29, 72, 0.1)',
  success: '#16A34A',   // Sucesso / Aceitar (green-600)
  successLight: 'rgba(22, 163, 74, 0.1)',
  warning: '#D97706',   // Aviso (amber-600)
  warningLight: 'rgba(217, 119, 6, 0.1)',
  info: '#2563EB',      // Informação (blue-600)

  // ─── Swipe Colors ─────────────────────────────────────────────────
  swipeLike: '#16A34A',    // Swipe direita (match)
  swipeDislike: '#E11D48', // Swipe esquerda (ignorar)

  // ─── UI Elementos ─────────────────────────────────────────────────
  border: 'rgba(255, 255, 255, 0.08)', // Borda sutil dark
  borderLight: 'rgba(0, 0, 0, 0.1)',   // Borda sutil light
  overlay: 'rgba(0, 0, 0, 0.6)',       // Overlay de modal
  overlayLight: 'rgba(0, 0, 0, 0.45)', // Overlay mais suave
  skeleton: 'rgba(255, 255, 255, 0.06)', // Skeleton loading

  // ─── Gradientes (valores para LinearGradient) ─────────────────────
  gradientPurpleStart: '#6200D3',
  gradientPurpleEnd: '#9B59B6',
  gradientSplashStart: '#0E0F12',
  gradientSplashEnd: '#1B1825',

  // ─── Always ───────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
