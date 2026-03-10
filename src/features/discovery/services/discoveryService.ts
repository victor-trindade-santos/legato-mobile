import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Config } from '@/constants/config';
import { MOCK_MUSICIANS } from '../mocks/musicians.mock';
import type { Musician } from '../models/Musician';
import type { DiscoveryFilters } from '../models/DiscoveryFilters';

export async function fetchMusicians(filters?: Partial<DiscoveryFilters>): Promise<Musician[]> {
  if (Config.DEV_USE_MOCK) {
    let result = [...MOCK_MUSICIANS];
    if (filters?.skills?.length) {
      result = result.filter(m => m.skills.some(s => filters.skills!.includes(s)));
    }
    if (filters?.gender && filters.gender !== 'Todos') {
      result = result.filter(m => m.gender === filters.gender);
    }
    if (filters?.ageMin !== undefined) {
      result = result.filter(m => m.age >= filters.ageMin!);
    }
    if (filters?.ageMax !== undefined) {
      result = result.filter(m => m.age <= filters.ageMax!);
    }
    if (filters?.musicGenres?.length) {
      result = result.filter(m => m.musicGenres.some(g => filters.musicGenres!.includes(g)));
    }
    if (filters?.distanceMax !== undefined) {
      result = result.filter(m => m.distance <= filters.distanceMax!);
    }
    return result;
  }

  const res = await api.get<Musician[]>(Endpoints.discovery.musicians, { params: filters });
  return res.data;
}

export async function sendSwipe(musicianId: number, direction: 'like' | 'dislike'): Promise<{ match: boolean }> {
  if (Config.DEV_USE_MOCK) {
    // Simula match aleatório com 30% de chance no like
    const match = direction === 'like' && Math.random() < 0.3;
    return { match };
  }

  const res = await api.post(Endpoints.discovery.swipe, { musicianId, direction });
  return res.data;
}
