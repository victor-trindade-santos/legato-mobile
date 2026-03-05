/** Gêneros musicais disponíveis para filtros e perfil */
export const MUSIC_GENRES = [
  'Rock', 'MPB', 'Sertanejo', 'Funk', 'Jazz', 'Blues',
  'R&B / Soul', 'Hip-Hop', 'Eletrônico', 'House', 'Pop',
  'Clássico', 'Metal', 'Punk', 'Reggae', 'Forró', 'Samba',
  'Bossa Nova', 'Gospel', 'Indie', 'Lo-fi', 'Trap', 'Axé',
] as const;

export type MusicGenre = typeof MUSIC_GENRES[number];
