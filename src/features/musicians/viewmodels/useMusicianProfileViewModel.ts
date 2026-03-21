import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Musician } from '@/features/discovery/models/Musician';
import { fetchFavoriteArtists, fetchMusicianProfile } from '../services/musicianProfileService';
import type { FavoriteArtist, ProfileStats, PublicMusicianProfile } from '../models/MusicianProfile';
import { PROFILE_TABS } from '../models/MusicianProfile';

export type { ProfileTab } from '../models/MusicianProfile';

function buildObjective(musician: Musician): string {
  return musician.bio ? musician.bio.split('.')[0] + '.' : 'Sem objetivo definido.';
}

function buildStats(_musician: Musician): ProfileStats {
  // Placeholder: retorna zeros até o backend expor esses dados
  return { connections: 0, followers: 0, posts: 0 };
}

export function useMusicianProfileViewModel(musicianId: number) {
  const [activeTab, setActiveTab] = useState<import('../models/MusicianProfile').ProfileTab>('overview');
  const [isConnected, setIsConnected] = useState(false);

  const { data: musician, isLoading } = useQuery({
    queryKey: ['musician-profile', musicianId],
    queryFn: () => fetchMusicianProfile(musicianId),
  });

  const { data: favoriteArtistsData = [] } = useQuery({
    queryKey: ['musician-profile', musicianId, 'favorite-artists'],
    queryFn: () => fetchFavoriteArtists(musicianId),
  });

  const favoriteArtists = useMemo<FavoriteArtist[]>(
    () => favoriteArtistsData.map((artist) => ({
      id: artist.id,
      username: artist.username,
      displayName: artist.displayName,
      avatarUrl: artist.avatarUrl,
    })),
    [favoriteArtistsData],
  );

  const profile = useMemo<PublicMusicianProfile | null>(() => {
    if (!musician) return null;

    return {
      ...musician,
      bio: musician.bio ?? 'Sem bio disponível.',
      objective: buildObjective(musician),
      stats: buildStats(musician),
      favoriteArtists,
    };
  }, [musician, favoriteArtists]);

  return {
    profile,
    isLoading,
    activeTab,
    tabs: PROFILE_TABS,
    isConnected,
    setActiveTab,
    toggleConnection: () => setIsConnected((prev) => !prev),
  };
}
