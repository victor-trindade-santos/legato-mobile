import type { MusicGenre } from '@/constants/genres';

export interface Musician {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  distance: number;
  age: number;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  skills: string[];
  musicGenres: MusicGenre[];
  bio?: string;
  location?: string;
  photos?: string[];   // até 4 fotos; primeira é a principal
}
