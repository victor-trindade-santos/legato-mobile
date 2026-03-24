/**
 * MusicianProfile — Model (perfil público de músico)
 *
 * Tipos de domínio exclusivos da feature musicians.
 * Independente de outras features (discovery, auth, etc.).
 *
 * MusicianProfileDTO: contrato com o backend — reflete o que /musicians/:id retorna.
 * PublicMusicianProfile: objeto enriquecido usado na View (composto pelo ViewModel).
 */

/** Resposta bruta do endpoint GET /musicians/:id */
export interface MusicianProfileDTO {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  skills: string[];
  musicGenres: string[];
  photos?: string[];
}

/** Resposta bruta do endpoint GET /musicians/:id/favorite-artists */
export interface FavoriteArtist {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

/** Estatísticas de perfil — retornadas pelo backend (zeros enquanto endpoint não existe) */
export interface ProfileStats {
  connections: number;
  followers: number;
  posts: number;
}

/**
 * Perfil público enriquecido — composto pelo ViewModel a partir de MusicianProfileDTO.
 * Contém campos derivados (bio com fallback, objective, stats, favoriteArtists).
 */
export interface PublicMusicianProfile {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio: string;
  location?: string;
  skills: string[];
  musicGenres: string[];
  objective: string;
  stats: ProfileStats;
  favoriteArtists: FavoriteArtist[];
}

export type ProfileTab = 'overview' | 'activity' | 'music' | 'collaborations';
