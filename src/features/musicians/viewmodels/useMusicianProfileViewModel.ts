/**
 * useMusicianProfileViewModel — ViewModel
 *
 * Gerencia todo o estado e lógica da tela MusicianProfileScreen.
 * A View apenas consome este hook e renderiza o que ele expõe.
 *
 * Responsabilidades:
 *  - Buscar e compor o perfil público (TanStack Query)
 *  - Controlar aba ativa
 *  - Controlar estado de conexão (otimista — será persistido quando o endpoint existir)
 *  - Controlar visibilidade do painel de artistas favoritos
 *  - Calcular quais artistas favoritos cabem na linha (responsivo)
 */

import { useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Spacing } from '@/theme';
import { getMusicianById, getFavoriteArtists } from '../services/musicianProfileService';
import type { PublicMusicianProfile, ProfileTab } from '../models/MusicianProfile';

export type { ProfileTab } from '../models/MusicianProfile';

const PROFILE_TABS: Array<{ key: ProfileTab; label: string }> = [
  { key: 'overview', label: 'Visão Geral' },
  { key: 'activity', label: 'Atividade' },
  { key: 'music', label: 'Músicas' },
  { key: 'collaborations', label: 'Colaborações' },
];

export function useMusicianProfileViewModel(musicianId: number) {
  const { width: screenWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState(false);

  const { data: musician, isLoading } = useQuery({
    queryKey: ['musician-profile', musicianId],
    queryFn: () => getMusicianById(musicianId),
  });

  const { data: favoriteArtistsData = [] } = useQuery({
    queryKey: ['musician-profile', musicianId, 'favorite-artists'],
    queryFn: () => getFavoriteArtists(musicianId),
    enabled: !!musician,
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

  // Compõe o perfil público a partir do DTO bruto
  const profile = useMemo<PublicMusicianProfile | null>(() => {
    if (!musician) return null;
    const bio = musician.bio ?? 'Sem bio disponível.';
    const firstSentence = musician.bio?.split('.')[0]?.trim();
    return {
      id: musician.id,
      username: musician.username,
      displayName: musician.displayName,
      avatarUrl: musician.avatarUrl,
      bio,
      location: musician.location,
      skills: musician.skills,
      musicGenres: musician.musicGenres,
      objective: firstSentence ? `${firstSentence}.` : 'Sem objetivo definido.',
      stats: { connections: 0, followers: 0, posts: 0 },
      favoriteArtists: favoriteArtistsData,
    };
  }, [musician, favoriteArtistsData]);

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
