/**
 * MusicianProfile — Model (perfil público de músico)
 *
 * Tipos de domínio exclusivos da feature musicians.
 * Independente de outras features (discovery, auth, etc.).
 *
 * MusicianProfileDTO: contrato com o backend — reflete o que /musicians/:id retorna.
 * PublicMusicianProfile: objeto enriquecido usado na View (composto pelo ViewModel).
 */

/**
 * Resposta bruta do backend — campos mapeados do contrato real:
 *  GET /users/me  (próprio perfil)
 *  GET /users/{username}  (perfil de outro usuário)
 *
 * O backend usa nomes diferentes (profilePicture, instruments, genres…).
 * O serviço converte para este DTO antes de entregar ao ViewModel.
 */
export interface MusicianProfileDTO {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  location?: string;          // montado como "city, state" pelo service
  skills: string[];           // backend: instruments
  musicGenres: string[];      // backend: genres
  photos?: string[];          // backend: photosCard
  // Stats — disponíveis em /users/me e /users/{username}
  connectionsCount?: number;
  followersCount?: number;
  postsCount?: number;
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
  bannerUrl?: string;
  bio: string;
  location?: string;
  skills: string[];
  musicGenres: string[];
  objective: string;
  photos: string[];
  stats: ProfileStats;
  favoriteArtists: FavoriteArtist[];
}

export type ProfileTab = 'overview' | 'activity' | 'music' | 'collaborations';
