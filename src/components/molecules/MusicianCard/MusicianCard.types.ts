export interface MusicianCardData {
  id: number;
  username?: string;
  displayName: string;
  avatarUrl?: string;
  distance: number;        // km
  age: number;
  skills: string[];
  musicGenres: string[];
  bio?: string;
  gender?: string;
  location?: string;
  photos?: string[];   // até 4 fotos; primeira é a principal
}

export interface MusicianCardProps {
  musician: MusicianCardData;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;  // Abre perfil completo do músico
  isTop?: boolean;           // Card no topo do stack — ativa gestos de swipe
}
