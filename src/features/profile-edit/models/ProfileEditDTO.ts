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
  website: string;
}

/** Corpo enviado ao PUT /users */
export interface UpdateProfileDTO {
  profilePicture: string;
  profileBanner: string;
  photosCard: string[];
  sex?: string;        // opcional — não enviar se não selecionado
  bio: string;
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
  profilePicture?: string | null;
  profileBanner?: string | null;
  photosCard?: string[];
}

/** Resposta de /users/upload-image e /users/card-file */
export type UploadImageResponse = BackendEnvelope<UploadedUserData>;
