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

export async function getMusicianById(musicianId: number): Promise<MusicianProfileDTO | null> {
  if (Config.DEV_USE_MOCK) {
    const mock = MOCK_MUSICIANS.find((m) => m.id === musicianId) ?? null;
    if (!mock) return null;
    // Mapeia apenas os campos do perfil (sem os campos específicos de discovery: distance, age, gender)
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
    const res = await api.get<MusicianProfileDTO>(Endpoints.musicians.getById(musicianId));
    return res.data;
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
