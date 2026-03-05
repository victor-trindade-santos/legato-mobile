/** Habilidades/instrumentos disponíveis para filtros e perfil */
export const SKILLS = [
  'Guitarra', 'Violão', 'Baixo', 'Bateria', 'Teclado',
  'Piano', 'Violino', 'Saxofone', 'Flauta', 'Trompete',
  'Voz / Canto', 'Produção Musical', 'DJ', 'Composição',
  'Arranjo', 'Gravação', 'Mixagem', 'Masterização',
  'Cavaquinho', 'Ukulele', 'Mandolin', 'Cello',
] as const;

export type Skill = typeof SKILLS[number];
