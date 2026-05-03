export type AuthHeaderLogoVariant = 'dark' | 'light' | 'vertical' | 'verticalForgotPassword';

export interface AuthHeaderProps {
  subtitle: string;
  logoVariant?: AuthHeaderLogoVariant;
}
