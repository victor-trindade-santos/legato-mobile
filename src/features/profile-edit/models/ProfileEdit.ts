/**
 * ProfileEdit — Model
 * Tipos para o formulário de edição do próprio perfil.
 */

export interface SocialLinks {
  instagram?: string;
  spotify?: string;
  youtube?: string;
  soundcloud?: string;
  website?: string;
}

export interface ProfileEditPayload {
  displayName: string;
  username: string;
  bio?: string;
  skills: string[];
  musicGenres: string[];
  socialLinks: SocialLinks;
}
