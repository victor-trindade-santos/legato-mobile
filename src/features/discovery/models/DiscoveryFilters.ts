export interface DiscoveryFilters {
  skills: string[];
  gender: 'Todos' | 'Masculino' | 'Feminino' | 'Outro';
  ageMin: number;
  ageMax: number;
  musicGenres: string[];
  distanceMin: number;
  distanceMax: number;
}

export const DEFAULT_FILTERS: DiscoveryFilters = {
  skills: [],
  gender: 'Todos',
  ageMin: 16,
  ageMax: 60,
  musicGenres: [],
  distanceMin: 0,
  distanceMax: 100,
};
