/**
 * ProfileEditDTO — Contratos com o backend
 *
 * Espelham exatamente o que a API espera/retorna.
 * Independentes do estado do formulário (ProfileEdit.ts).
 *
 * PUT /users                                   → UpdateProfileDTO
 * PUT /users/upload-image?type=profile|banner  → BackendEnvelope<UploadImageData>
 * PUT /users/card-file                         → BackendEnvelope<UploadImageData>
 */

export interface ProfileLocationDTO {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
}

export interface ProfileLinksDTO {
  instagram: string;
  spotify: string;
  youtube: string;
  soundcloud: string;
  website: string;
}

/** Corpo enviado ao PUT /users */
export interface UpdateProfileDTO {
  profilePicture: string;
  profileBanner: string;
  photosCard: string[];
  sex?: string;        // opcional — não enviar se não selecionado
  bio: string;
  objective?: string;  // opcional — não enviar se vazio
  instruments: string[];
  genres: string[];
  location: ProfileLocationDTO;
  links: ProfileLinksDTO;
}

/** Envelope padrão de resposta do backend */
export interface BackendEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

/**
 * O backend retorna o usuário atualizado em todos os endpoints de upload.
 * Apenas os campos relevantes para extração de URL são listados.
 */
export interface UploadedUserData {
  displayName?: string;
  username?: string;
  profilePicture?: string | null;
  profileBanner?: string | null;
  photosCard?: string[];
}

/** Resposta de /users/upload-image e /users/card-file */
export type UploadImageResponse = BackendEnvelope<UploadedUserData>;

/** Perfil completo retornado pelo GET /users/me */
export interface UserProfileDTO {
  id: number;
  displayName: string;
  username: string;
  email: string;
  profilePicture?: string | null;
  profileBanner?: string | null;
  photosCard?: string[];
  bio?: string | null;
  objective?: string | null;
  instruments?: string[];   // skills
  genres?: string[];        // musicGenres
  sex?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  } | null;
  links?: {
    instagram?: string;
    spotify?: string;
    youtube?: string;
    soundcloud?: string;
    website?: string;
  } | null;
}
