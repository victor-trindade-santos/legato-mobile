/**
 * musicianProfileService — Service
 *
 * Endpoints utilizados:
 *  - GET /users/me            → perfil do próprio usuário autenticado
 *  - GET /users/{username}    → perfil público de outro usuário
 *
 * O backend usa nomes de campo diferentes do modelo interno (ex: profilePicture
 * vs avatarUrl, instruments vs skills). O mapeamento acontece aqui, antes de
 * entregar ao ViewModel — nenhuma outra camada precisa conhecer os nomes do backend.
 */

import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Config } from '@/constants/config';
import { MOCK_MUSICIANS } from '@/features/discovery/mocks/musicians.mock';
import { normalizeMusicGenres } from '@/constants/genres';
import type { MusicianProfileDTO, FavoriteArtist } from '../models/MusicianProfile';

/** Envelope padrão do backend */
interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

/** DTO bruto retornado por GET /users/me e GET /users/{username} */
interface BackendUserDTO {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  profileBanner?: string;
  bio?: string;
  objective?: string | null;
  photosCard?: string[];
  instruments?: string[];
  genres?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  connectionsCount?: number;
  followersCount?: number;
  postsIds?: unknown[];
}

/** Converte o DTO bruto do backend para o modelo interno */
function mapBackendUser(raw: BackendUserDTO): MusicianProfileDTO {
  const { city, state } = raw.location ?? {};
  const locationStr = city
    ? [city, state].filter(Boolean).join(', ')
    : undefined;

  return {
    id: raw.id,
    username: raw.username,
    displayName: raw.displayName,
    avatarUrl: raw.profilePicture ?? undefined,
    bannerUrl: raw.profileBanner ?? undefined,
    bio: raw.bio,
    objective: raw.objective ?? undefined,
    location: locationStr,
    skills: raw.instruments ?? [],
    musicGenres: normalizeMusicGenres(raw.genres ?? []),
    photos: raw.photosCard ?? [],
    connectionsCount: raw.connectionsCount ?? 0,
    followersCount: raw.followersCount ?? 0,
    postsCount: raw.postsIds?.length ?? 0,
  };
}

/** Busca o perfil do próprio usuário autenticado via GET /users/me */
export async function getMyProfile(): Promise<MusicianProfileDTO | null> {
  if (Config.DEV_USE_MOCK) {
    const mock = MOCK_MUSICIANS[0];
    if (!mock) return null;
    return {
      id: mock.id,
      username: mock.username,
      displayName: mock.displayName,
      avatarUrl: mock.avatarUrl,
      bio: mock.bio,
      location: mock.location,
      skills: mock.skills,
      musicGenres: normalizeMusicGenres(mock.musicGenres),
      photos: mock.photos,
      connectionsCount: 0,
      followersCount: 0,
      postsCount: 0,
    };
  }

  try {
    const res = await api.get<BackendEnvelope<BackendUserDTO>>(Endpoints.users.me);
    if (!res.data.data) return null;
    return mapBackendUser(res.data.data);
  } catch {
    return null;
  }
}

/** Busca o perfil público de outro usuário via GET /musicians/{id} */
export async function getMusicianById(id: number): Promise<MusicianProfileDTO | null> {
  if (Config.DEV_USE_MOCK) {
    const mock = MOCK_MUSICIANS.find((m) => m.id === id) ?? null;
    if (!mock) return null;
    return {
      id: mock.id,
      username: mock.username,
      displayName: mock.displayName,
      avatarUrl: mock.avatarUrl,
      bio: mock.bio,
      location: mock.location,
      skills: mock.skills,
      musicGenres: normalizeMusicGenres(mock.musicGenres),
      photos: mock.photos,
      connectionsCount: 0,
      followersCount: 0,
      postsCount: 0,
    };
  }

  try {
    const res = await api.get<BackendEnvelope<BackendUserDTO>>(Endpoints.musicians.getById(id));
    if (!res.data.data) return null;
    return mapBackendUser(res.data.data);
  } catch {
    return null;
  }
}

/** Busca o perfil público de outro usuário via GET /users/{username} */
export async function getMusicianByUsername(username: string): Promise<MusicianProfileDTO | null> {
  if (Config.DEV_USE_MOCK) {
    const mock = MOCK_MUSICIANS.find((m) => m.username === username) ?? MOCK_MUSICIANS[0];
    if (!mock) return null;
    return {
      id: mock.id,
      username: mock.username,
      displayName: mock.displayName,
      avatarUrl: mock.avatarUrl,
      bio: mock.bio,
      location: mock.location,
      skills: mock.skills,
      musicGenres: normalizeMusicGenres(mock.musicGenres),
      photos: mock.photos,
    };
  }

  try {
    const res = await api.get<BackendEnvelope<BackendUserDTO>>(
      Endpoints.users.getByUsername(username),
    );
    if (!res.data.data) return null;
    return mapBackendUser(res.data.data);
  } catch {
    return null;
  }
}

export async function getFavoriteArtists(musicianId: number): Promise<FavoriteArtist[]> {
  if (Config.DEV_USE_MOCK) {
    return MOCK_MUSICIANS
      .filter((m) => m.id !== musicianId)
      .slice(0, 4)
      .map((m) => ({
        id: m.id,
        username: m.username,
        displayName: m.displayName,
        avatarUrl: m.avatarUrl,
      }));
  }

  try {
    const res = await api.get<{ success: boolean; data: unknown[] }>(
      Endpoints.musicians.favoriteArtists(musicianId),
    );
    const raw = res.data.data ?? [];
    if (!Array.isArray(raw)) return [];
    // Backend retorna string[] com nomes dos artistas — adapta para o modelo interno
    if (raw.length > 0 && typeof raw[0] === 'string') {
      return (raw as string[]).map((name, index) => ({
        id: index,
        displayName: name,
        username: name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        avatarUrl: undefined,
      }));
    }
    return raw as FavoriteArtist[];
  } catch {
    return [];
  }
}
