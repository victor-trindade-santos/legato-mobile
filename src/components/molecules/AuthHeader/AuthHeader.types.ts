export type AuthHeaderLogoVariant = 'dark' | 'light';

export interface AuthHeaderProps {
  subtitle: string;
  logoVariant?: AuthHeaderLogoVariant;
}
