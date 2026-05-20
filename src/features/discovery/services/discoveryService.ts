/**
 * discoveryService — Service (Descoberta)
 *
 * Endpoints:
 *  GET  /users/discovery          → lista de músicos para o swipe
 *  POST /users/discovery/like/:id → registra like; retorna { match, conversationId }
 *  POST /users/discovery/dislike/:id → registra dislike
 */

import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Config } from '@/constants/config';
import { normalizeMusicGenres } from '@/constants/genres';
import { MOCK_MUSICIANS } from '../mocks/musicians.mock';
import type { Musician } from '../models/Musician';
import type { DiscoveryFilters } from '../models/DiscoveryFilters';
import { DEFAULT_FILTERS } from '../models/DiscoveryFilters';

// ─── DTO do backend ────────────────────────────────────────────────────────────

interface BackendDiscoveryUserDTO {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  photosCard?: string[];
  sex?: string;
  birthDate?: string;
  instruments?: string[];
  genres?: string[];
  bio?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

interface BackendDiscoveryEnvelope {
  success: boolean;
  message: string;
  data: BackendDiscoveryUserDTO[];
}

interface BackendLikeResponse {
  success: boolean;
  message: string;
  data: {
    match: boolean;
    conversationId: number;
  };
}

// ─── Mapeamentos de filtro ────────────────────────────────────────────────────

const GENDER_TO_SEX: Partial<Record<DiscoveryFilters['gender'], string>> = {
  Masculino: 'MALE',
  Feminino: 'FEMALE',
  Outro: 'OTHER',
};

// ─── Mapper ────────────────────────────────────────────────────────────────────

const SEX_MAP: Record<string, Musician['gender']> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  OTHER: 'Outro',
  PREFER_NOT_TO_SAY: 'Outro',
};

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function mapBackendUserToMusician(raw: BackendDiscoveryUserDTO): Musician {
  const city = raw.location?.city ?? '';
  const state = raw.location?.state ?? '';
  const cityState = state ? city + ', ' + state : city;
  const location = city ? cityState : undefined;

  return {
    id: raw.id,
    username: raw.username,
    displayName: raw.displayName,
    avatarUrl: raw.profilePicture ?? undefined,
    distance: 0,
    age: raw.birthDate ? calculateAge(raw.birthDate) : 0,
    gender: SEX_MAP[raw.sex ?? ''] ?? 'Outro',
    skills: raw.instruments ?? [],
    musicGenres: normalizeMusicGenres(raw.genres ?? []),
    bio: raw.bio,
    location,
    photos: raw.photosCard ?? [],
  };
}

// ─── Helpers de filtro ────────────────────────────────────────────────────────

function applyMockFilters(result: Musician[], filters: Partial<DiscoveryFilters>): Musician[] {
  if (filters.skills?.length) {
    result = result.filter(m => m.skills.some(s => filters.skills!.includes(s)));
  }
  if (filters.gender && filters.gender !== 'Todos') {
    result = result.filter(m => m.gender === filters.gender);
  }
  if (filters.ageMin !== undefined) {
    result = result.filter(m => m.age >= filters.ageMin!);
  }
  if (filters.ageMax !== undefined) {
    result = result.filter(m => m.age <= filters.ageMax!);
  }
  if (filters.musicGenres?.length) {
    result = result.filter(m => m.musicGenres.some(g => filters.musicGenres!.includes(g)));
  }
  return result;
}

function buildDiscoveryParams(filters: Partial<DiscoveryFilters>): Record<string, unknown> {
  const params: Record<string, unknown> = { limit: 20 };

  if (filters.gender && filters.gender !== 'Todos') {
    params.sex = GENDER_TO_SEX[filters.gender];
  }
  if (filters.skills?.length) params.instruments = filters.skills;
  if (filters.musicGenres?.length) params.genres = filters.musicGenres;
  if (filters.ageMin !== undefined) params.ageMin = filters.ageMin;
  if (filters.ageMax !== undefined) params.ageMax = filters.ageMax;

  // Só envia distância se ajustada — evita excluir usuários sem localização cadastrada.
  const distMin = filters.distanceMin ?? DEFAULT_FILTERS.distanceMin;
  const distMax = filters.distanceMax ?? DEFAULT_FILTERS.distanceMax;
  if (distMin > DEFAULT_FILTERS.distanceMin || distMax < DEFAULT_FILTERS.distanceMax) {
    params.minDistance = distMin;
    params.maxDistance = distMax;
  }

  return params;
}

// ─── Funções exportadas ────────────────────────────────────────────────────────

export async function fetchMusicians(filters?: Partial<DiscoveryFilters>): Promise<Musician[]> {
  if (Config.DEV_USE_MOCK) {
    return applyMockFilters([...MOCK_MUSICIANS], filters ?? {});
  }

  const res = await api.get<BackendDiscoveryEnvelope>(Endpoints.discovery.musicians, {
    params: buildDiscoveryParams(filters ?? {}),
    paramsSerializer: { indexes: null },
  });
  return (res.data.data ?? []).map(mapBackendUserToMusician);
}

/** Registra like e retorna se houve match e o conversationId */
export async function likeMusician(
  musicianId: number,
): Promise<{ match: boolean; conversationId: number }> {
  if (Config.DEV_USE_MOCK) {
    const match = Math.random() < 0.3;
    return { match, conversationId: match ? 1 : 0 };
  }

  const res = await api.post<BackendLikeResponse>(Endpoints.discovery.like(musicianId));
  return res.data.data;
}

/** Registra dislike (sem retorno relevante) */
export async function dislikeMusician(musicianId: number): Promise<void> {
  if (Config.DEV_USE_MOCK) return;
  await api.post(Endpoints.discovery.dislike(musicianId));
}
