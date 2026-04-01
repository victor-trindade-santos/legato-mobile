/**
 * useMusicianProfileViewModel — ViewModel
 *
 * Gerencia todo o estado e lógica da tela MusicianProfileScreen.
 * A View apenas consome este hook e renderiza o que ele expõe.
 *
 * Estratégia de busca:
 *  - Perfil próprio (isOwnProfile) → GET /users/me
 *  - Perfil de outro usuário       → GET /users/{username}
 *  - Fallback (ambos falharem)     → dados do authStore (básico)
 */

import { useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { getMyProfile, getMusicianByUsername, getFavoriteArtists } from '../services/musicianProfileService';
import type { PublicMusicianProfile, ProfileTab } from '../models/MusicianProfile';

export type { ProfileTab } from '../models/MusicianProfile';

const PROFILE_TABS: Array<{ key: ProfileTab; label: string }> = [
  { key: 'overview', label: 'Visão Geral' },
  { key: 'activity', label: 'Atividade' },
  { key: 'music', label: 'Músicas' },
  { key: 'collaborations', label: 'Colaborações' },
];

export function useMusicianProfileViewModel(musicianId: number, username?: string) {
  const { width: screenWidth } = useWindowDimensions();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState(false);

  const isOwnProfile = musicianId === user?.id;

  // Perfil próprio → GET /users/me
  const { data: ownProfile, isLoading: isLoadingOwn } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    enabled: isOwnProfile,
    retry: false,
    staleTime: 60 * 1000,
  });

  // Perfil de outro usuário → GET /users/{username}
  const targetUsername = username ?? user?.username ?? '';
  const { data: otherProfile, isLoading: isLoadingOther } = useQuery({
    queryKey: ['musician-profile', targetUsername],
    queryFn: () => getMusicianByUsername(targetUsername),
    enabled: !isOwnProfile && !!targetUsername,
    retry: false,
    staleTime: 60 * 1000,
  });

  const musician = isOwnProfile ? ownProfile : otherProfile;
  const isLoading = isOwnProfile ? isLoadingOwn : isLoadingOther;

  const { data: favoriteArtistsData = [] } = useQuery({
    queryKey: ['musician-profile', musicianId, 'favorite-artists'],
    queryFn: () => getFavoriteArtists(musicianId),
    enabled: !!musician,
    retry: false,
  });

  // Subset de artistas favoritos que cabe na linha com base na largura real da tela
  const visibleFavoriteArtists = useMemo(() => {
    const availableWidth =
      screenWidth - Spacing.screenPaddingH * 2 - Spacing.cardPadding * 2;
    const itemMinWidth = Spacing.avatarMd + Spacing.lg;
    const canFitFour = availableWidth >= itemMinWidth * 4 + Spacing.sm * 3;
    const canFitThree = availableWidth >= itemMinWidth * 3 + Spacing.sm * 2;
    const count = canFitFour ? 4 : canFitThree ? 3 : 2;
    return favoriteArtistsData.slice(0, count);
  }, [favoriteArtistsData, screenWidth]);

  // Compõe o perfil público — fallback para authStore se API falhar
  const profile = useMemo<PublicMusicianProfile | null>(() => {
    const source = musician ?? (
      isOwnProfile && user
        ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            bannerUrl: user.bannerUrl,
            bio: user.bio,
            location: user.location,
            skills: user.skills ?? [],
            musicGenres: user.musicGenres ?? [],
            photos: user.photos ?? [],
          }
        : null
    );
    if (!source) return null;

    const bio = source.bio ?? 'Sem bio disponível.';
    const firstSentence = source.bio?.split('.')[0]?.trim();

    return {
      id: source.id,
      username: source.username,
      displayName: source.displayName,
      avatarUrl: source.avatarUrl,
      bannerUrl: source.bannerUrl,
      bio,
      location: source.location,
      skills: source.skills ?? [],
      musicGenres: source.musicGenres ?? [],
      objective: firstSentence ? `${firstSentence}.` : 'Sem objetivo definido.',
      photos: source.photos ?? [],
      stats: {
        connections: source.connectionsCount ?? 0,
        followers: source.followersCount ?? 0,
        posts: source.postsCount ?? 0,
      },
      favoriteArtists: favoriteArtistsData,
    };
  }, [musician, favoriteArtistsData, user, isOwnProfile]);

  return {
    profile,
    isLoading,
    activeTab,
    tabs: PROFILE_TABS,
    isConnected,
    isFavoritesPanelOpen,
    visibleFavoriteArtists,
    setActiveTab,
    toggleConnection: () => setIsConnected((prev) => !prev),
    openFavoritesPanel: () => setIsFavoritesPanelOpen(true),
    closeFavoritesPanel: () => setIsFavoritesPanelOpen(false),
  };
}
