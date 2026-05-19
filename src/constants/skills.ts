/** Habilidades/instrumentos — chaves batem com o enum InstrumentList do backend */
export const SKILLS = [
  'GUITARRA', 'VIOLAO', 'BAIXO', 'BATERIA', 'TECLADO',
  'PIANO', 'VIOLINO', 'SAXOFONE', 'FLAUTA', 'TROMPETE',
  'VOZ_CANTO', 'PRODUCAO_MUSICAL', 'DJ', 'COMPOSICAO',
  'ARRANJO', 'GRAVACAO', 'MIXAGEM', 'MASTERIZACAO',
  'CAVAQUINHO', 'UKULELE', 'MANDOLIN', 'CELLO',
] as const;

export type Skill = typeof SKILLS[number];

const SKILL_LABELS: Record<Skill, string> = {
  GUITARRA:         'Guitarra',
  VIOLAO:           'Violão',
  BAIXO:            'Baixo',
  BATERIA:          'Bateria',
  TECLADO:          'Teclado',
  PIANO:            'Piano',
  VIOLINO:          'Violino',
  SAXOFONE:         'Saxofone',
  FLAUTA:           'Flauta',
  TROMPETE:         'Trompete',
  VOZ_CANTO:        'Voz / Canto',
  PRODUCAO_MUSICAL: 'Produção Musical',
  DJ:               'DJ',
  COMPOSICAO:       'Composição',
  ARRANJO:          'Arranjo',
  GRAVACAO:         'Gravação',
  MIXAGEM:          'Mixagem',
  MASTERIZACAO:     'Masterização',
  CAVAQUINHO:       'Cavaquinho',
  UKULELE:          'Ukulele',
  MANDOLIN:         'Mandolin',
  CELLO:            'Cello',
};

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function normalizeSkill(value: string): Skill | string {
  const normalized = stripDiacritics(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return (SKILLS as readonly string[]).includes(normalized)
    ? (normalized as Skill)
    : normalized;
}

export function normalizeSkills(values: readonly string[] | null | undefined): Skill[] {
  return (values ?? [])
    .map(normalizeSkill)
    .filter((value): value is Skill => (SKILLS as readonly string[]).includes(value))
    .filter((value, index, array) => array.indexOf(value) === index);
}

export function getSkillLabel(value: string): string {
  const normalized = normalizeSkill(value);
  return (SKILL_LABELS as Record<string, string>)[normalized] ?? value;
}
