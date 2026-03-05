export interface MusicianCardData {
  id: number;
  name: string;
  displayName: string;
  avatarUrl?: string;
  distance: number;        // km
  age: number;
  skills: string[];
  musicGenres: string[];
  bio?: string;
  gender?: string;
}

export interface MusicianCardProps {
  musician: MusicianCardData;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isTop?: boolean;         // Card no topo do stack
}
