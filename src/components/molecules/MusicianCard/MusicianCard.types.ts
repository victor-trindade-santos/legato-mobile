import type { MusicGenre } from '@/constants/genres';

export interface MusicianCardData {
  id: number;
  username?: string;
  displayName: string;
  avatarUrl?: string;
  distance: number;        // km
  age: number;
  skills: string[];
  musicGenres: MusicGenre[];
  bio?: string;
  gender?: string;
  location?: string;
  photos?: string[];   // até 4 fotos; primeira é a principal
}

export interface MusicianCardProps {
  musician: MusicianCardData;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isTop?: boolean;           // Card no topo do stack — ativa gestos de swipe
  // Perfil completo para seção de rolagem interna (opcional)
  profile?: {
    username: string;
    bio: string;
    objective: string;
    skills: string[];
    musicGenres: MusicGenre[];
    stats: {
      connections: number;
      followers: number;
      posts: number;
    };
    favoriteArtists: Array<{
      id: number;
      displayName: string;
      username: string;
      avatarUrl?: string;
    }>;
  };
}
