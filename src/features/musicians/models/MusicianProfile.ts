/**
 * MusicianProfile — Model (perfil público de músico)
 *
 * Tipos de domínio exclusivos da feature musicians.
 * Os dados reais vêm do endpoint de perfil; enquanto
 * o backend não expõe os campos extras, os valores são
 * preenchidos com defaults neutros no ViewModel.
 */

import type { Musician } from '@/features/discovery/models/Musician';

export interface FavoriteArtist {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface ProfileStats {
  connections: number;
  followers: number;
  posts: number;
}

export interface PublicMusicianProfile extends Musician {
  objective: string;
  stats: ProfileStats;
  favoriteArtists: FavoriteArtist[];
}

export type ProfileTab = 'overview' | 'activity' | 'music' | 'collaborations';

export const PROFILE_TABS: Array<{ key: ProfileTab; label: string }> = [
  { key: 'overview', label: 'Visão Geral' },
  { key: 'activity', label: 'Atividade' },
  { key: 'music', label: 'Músicas' },
  { key: 'collaborations', label: 'Colaborações' },
];
