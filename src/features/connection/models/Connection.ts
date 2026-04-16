import type { MusicGenre } from '@/constants/genres';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface Connection {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string;
    skills: string[];
    musicGenres: MusicGenre[];
  };
  status: ConnectionStatus;
  createdAt: string;
}
