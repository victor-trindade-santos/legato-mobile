import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import type { Musician } from '../models/Musician';
import type { DiscoveryFilters } from '../models/DiscoveryFilters';

export async function fetchMusicians(filters?: Partial<DiscoveryFilters>): Promise<Musician[]> {
  const res = await api.get<Musician[]>(Endpoints.discovery.musicians, { params: filters });
  return res.data;
}

export async function sendSwipe(musicianId: number, direction: 'like' | 'dislike'): Promise<{ match: boolean }> {
  const res = await api.post(Endpoints.discovery.swipe, { musicianId, direction });
  return res.data;
}
