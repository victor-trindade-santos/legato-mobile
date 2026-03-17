import type { Musician } from '@/features/discovery/models/Musician';
import {
  fetchMusicianById as fetchDiscoveryMusicianById,
  fetchMusicians as fetchDiscoveryMusicians,
} from '@/features/discovery/services/discoveryService';

export async function fetchMusicianProfile(musicianId: number): Promise<Musician | null> {
  return fetchDiscoveryMusicianById(musicianId);
}

export async function fetchFavoriteArtists(musicianId: number): Promise<Musician[]> {
  const musicians = await fetchDiscoveryMusicians();
  return musicians.filter((artist) => artist.id !== musicianId).slice(0, 4);
}
