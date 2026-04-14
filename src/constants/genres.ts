/** Gêneros musicais disponíveis para filtros e perfil */
export const MUSIC_GENRES = [
  'rock', 'mpb', 'sertanejo', 'funk', 'jazz', 'blues',
  'rbsoul', 'hiphop', 'eletronico', 'house', 'pop',
  'classico', 'metal', 'punk', 'reggae', 'forro', 'samba',
  'bossanova', 'gospel', 'indie', 'lofi', 'trap', 'axe',
] as const;

export type MusicGenre = typeof MUSIC_GENRES[number];

const MUSIC_GENRE_LABELS: Record<MusicGenre, string> = {
  rock: 'Rock',
  mpb: 'MPB',
  sertanejo: 'Sertanejo',
  funk: 'Funk',
  jazz: 'Jazz',
  blues: 'Blues',
  rbsoul: 'R&B / Soul',
  hiphop: 'Hip-Hop',
  eletronico: 'Eletrônico',
  house: 'House',
  pop: 'Pop',
  classico: 'Clássico',
  metal: 'Metal',
  punk: 'Punk',
  reggae: 'Reggae',
  forro: 'Forró',
  samba: 'Samba',
  bossanova: 'Bossa Nova',
  gospel: 'Gospel',
  indie: 'Indie',
  lofi: 'Lo-fi',
  trap: 'Trap',
  axe: 'Axé',
};

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeMusicGenre(value: string): MusicGenre | string {
  const normalized = stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  return (MUSIC_GENRES as readonly string[]).includes(normalized)
    ? (normalized as MusicGenre)
    : normalized;
}

export function normalizeMusicGenres(values: readonly string[] | null | undefined): MusicGenre[] {
  const normalized = (values ?? [])
    .map(normalizeMusicGenre)
    .filter((value): value is MusicGenre => (MUSIC_GENRES as readonly string[]).includes(value))
    .filter((value, index, array) => array.indexOf(value) === index);

  return normalized;
}

export function getMusicGenreLabel(value: string): string {
  const normalized = normalizeMusicGenre(value);
  return (MUSIC_GENRE_LABELS as Record<string, string>)[normalized] ?? value;
}
