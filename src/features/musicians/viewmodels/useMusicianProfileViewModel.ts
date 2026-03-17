import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Musician } from '@/features/discovery/models/Musician';
import { fetchFavoriteArtists, fetchMusicianProfile } from '../services/musicianProfileService';

export type ProfileTab = 'overview' | 'activity' | 'music' | 'collaborations';

interface FavoriteArtist {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface ProfileStats {
  connections: number;
  followers: number;
  posts: number;
}

interface PublicMusicianProfile extends Musician {
  objective: string;
  stats: ProfileStats;
  favoriteArtists: FavoriteArtist[];
}

const PROFILE_TABS: Array<{ key: ProfileTab; label: string }> = [
  { key: 'overview', label: 'Visão Geral' },
  { key: 'activity', label: 'Atividade' },
  { key: 'music', label: 'Músicas' },
  { key: 'collaborations', label: 'Colaborações' },
];

function buildObjective(musician: Musician): string {
  const mainGenre = musician.musicGenres[0] ?? 'Indie';
  return `Lançar meu primeiro álbum ${mainGenre}.`;
}

function buildStats(musician: Musician): ProfileStats {
  return {
    connections: Math.max(0, musician.skills.length * 2),
    followers: Math.max(0, musician.id * 13),
    posts: musician.photos?.length ?? 0,
  };
}

export function useMusicianProfileViewModel(musicianId: number) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isConnected, setIsConnected] = useState(true);

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
