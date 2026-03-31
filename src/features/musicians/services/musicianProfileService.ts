/**
 * musicianProfileService — Service
 *
 * Responsabilidade exclusiva: chamadas HTTP para os endpoints de perfil de músico.
 * Sem lógica de filtro, sem estado, sem referência a outras features.
 *
 * Mock: enquanto o backend não expõe /musicians/:id, usa os dados de discovery/mocks
 * apenas no modo DEV_USE_MOCK. Em produção, chama o endpoint real.
 */

import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Config } from '@/constants/config';
import { MOCK_MUSICIANS } from '@/features/discovery/mocks/musicians.mock';
import type { MusicianProfileDTO, FavoriteArtist } from '../models/MusicianProfile';

/** Envelope padrão do backend */
interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export async function getMusicianById(musicianId: number): Promise<MusicianProfileDTO | null> {
  if (Config.DEV_USE_MOCK) {
    // Fallback para o primeiro mock quando o ID não existe nos dados locais
    // (ex: ID real do backend não bate com os IDs fixos do mock)
    const mock = MOCK_MUSICIANS.find((m) => m.id === musicianId) ?? MOCK_MUSICIANS[0];
    if (!mock) return null;
    return {
      id: mock.id,
      username: mock.username,
      displayName: mock.displayName,
      avatarUrl: mock.avatarUrl,
      bio: mock.bio,
      location: mock.location,
      skills: mock.skills,
      musicGenres: mock.musicGenres,
      photos: mock.photos,
    };
  }

  try {
    const res = await api.get<BackendEnvelope<MusicianProfileDTO>>(
      Endpoints.musicians.getById(musicianId),
    );
    return res.data.data ?? null;
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
    const res = await api.get<FavoriteArtist[]>(Endpoints.musicians.favoriteArtists(musicianId));
    return res.data;
  } catch {
    return [];
  }
}
