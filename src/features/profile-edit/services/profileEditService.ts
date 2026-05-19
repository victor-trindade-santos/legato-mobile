/**
 * profileEditService — Service
 *
 * Orquestra o salvamento do perfil em até 3 etapas:
 *  1. Upload de avatar  → PUT /users/upload-image?type=profile → URL Cloudinary
 *  2. Upload de banner  → PUT /users/upload-image?type=banner  → URL Cloudinary
 *  3. Upload das fotos  → PUT /users/card-file (uma por arquivo) → URLs Cloudinary
 *  4. Atualiza perfil   → PUT /users com UpdateProfileDTO
 *
 * Em DEV_USE_MOCK=true nenhuma chamada é feita.
 * URIs já remotas (https://...) são passadas diretamente, sem re-upload.
 */

import { Platform } from 'react-native';
import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Config } from '@/constants/config';
import { normalizeMusicGenres, type MusicGenre } from '@/constants/genres';
import { normalizeSkills } from '@/constants/skills';
import type { ProfileEditFormData } from '../viewmodels/useProfileEditViewModel';
import type { UpdateProfileDTO, UploadImageResponse, BackendEnvelope, UploadedUserData, UserProfileDTO } from '../models/ProfileEditDTO';

/** URIs locais de mídia selecionadas pelo usuário (ainda não enviadas ao servidor) */
export interface ProfileMediaInput {
  avatarUri?: string;
  bannerUri?: string;
  photoUris: string[];
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Retorna true se a URI ainda não foi enviada ao servidor */
function isLocalUri(uri: string): boolean {
  return !uri.startsWith('http://') && !uri.startsWith('https://');
}

/**
 * Constrói um FormData com o arquivo de imagem.
 * Native: usa o objeto { uri, name, type } aceito pelo RN.
 * Web:    faz fetch da blob URI e anexa o Blob resultante.
 */
async function buildImageFormData(uri: string): Promise<FormData> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('file', blob, 'image.jpg');
  } else {
    const filename = uri.split('/').pop() ?? 'image.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    formData.append('file', { uri, name: filename, type: mimeType } as any);
  }

  return formData;
}

/** Envia avatar ou banner; retorna a URL pública do Cloudinary */
async function uploadProfileImage(
  uri: string,
  type: 'profile' | 'banner',
): Promise<string> {
  const formData = await buildImageFormData(uri);
  const endpoint = `${Endpoints.users.uploadImage}?type=${type}`;
  let res;
  try {
    res = await api.put<UploadImageResponse>(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [(data: any) => data],
    });
  } catch (err: any) {
    throw err;
  }
  if (!res.data.success) {
    throw new Error(res.data.message ?? 'Falha no upload da imagem');
  }
  const url = type === 'profile'
    ? res.data.data?.profilePicture
    : res.data.data?.profileBanner;
  return url ?? '';
}

/** Envia uma foto do carrossel; retorna a URL pública do Cloudinary */
async function uploadCardPhoto(uri: string, index: number): Promise<string> {
  const formData = await buildImageFormData(uri);
  let res;
  try {
    res = await api.put<UploadImageResponse>(
      `${Endpoints.users.cardFile}?index=${index}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: [(data: any) => data],
      },
    );
  } catch (err: any) {
    throw err;
  }
  if (!res.data.success) {
    throw new Error(res.data.message ?? 'Falha no upload da foto');
  }
  const photos = res.data.data?.photosCard ?? [];
  const resultUrl = photos[photos.length - 1] ?? '';
  return resultUrl;
}

// ─── fetch ────────────────────────────────────────────────────────────────────

export async function fetchMyProfile(): Promise<UserProfileDTO> {
  if (Config.DEV_USE_MOCK) {
    return {
      id: 1,
      displayName: 'Dev User',
      username: 'dev_user',
      email: 'dev@legato.com',
    };
  }
  const res = await api.get<BackendEnvelope<UserProfileDTO>>(Endpoints.users.me);
  if (!res.data.success || !res.data.data) throw new Error('Perfil não encontrado');
  return res.data.data;
}

// ─── save ─────────────────────────────────────────────────────────────────────

/** Dados de perfil retornados após salvar — usados para atualizar o authStore */
export interface SavedProfileData {
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  objective?: string;
  skills: string[];
  musicGenres: MusicGenre[];
  sex?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  city?: string;
  state?: string;
  country?: string;
  instagram?: string;
  spotify?: string;
  youtube?: string;
  soundcloud?: string;
  website?: string;
  photos: string[];
}

export async function saveProfile(
  data: ProfileEditFormData,
  media: ProfileMediaInput,
): Promise<SavedProfileData> {
  if (Config.DEV_USE_MOCK) {
    return {
      displayName: data.displayName,
      username: data.username,
      bio: data.bio,
      skills: normalizeSkills(data.skills),
      musicGenres: normalizeMusicGenres(data.musicGenres),
      photos: media.photoUris,
    };
  }

  // 1-3. Upload de imagens (só se forem URIs locais)
  const profilePicture =
    media.avatarUri && isLocalUri(media.avatarUri)
      ? await uploadProfileImage(media.avatarUri, 'profile')
      : (media.avatarUri ?? '');

  const profileBanner =
    media.bannerUri && isLocalUri(media.bannerUri)
      ? await uploadProfileImage(media.bannerUri, 'banner')
      : (media.bannerUri ?? '');

  // Card photos: falha individual não bloqueia o save (endpoint ainda instável no backend)
  const photosCard = await Promise.all(
    media.photoUris
      .filter(Boolean)
      .map((uri, index) =>
        isLocalUri(uri)
          ? uploadCardPhoto(uri, index).catch(() => uri)
          : uri,
      ),
  );

  // ⚠️ NOTA: displayName e username NÃO são suportados pelo endpoint PUT /users.
  // A API aceita apenas: profilePicture, profileBanner, photosCard, sex, bio,
  // objective, instruments, genres, location, links.
  const dto: UpdateProfileDTO = {
    profilePicture,
    profileBanner,
    photosCard,
    bio: data.bio ?? '',
    ...(data.objective ? { objective: data.objective } : {}),
    instruments: normalizeSkills(data.skills),
    genres: normalizeMusicGenres(data.musicGenres),
    location: {
      latitude: 0,
      longitude: 0,
      city: data.city ?? '',
      state: data.state ?? '',
      country: data.country ?? '',
    },
    links: {
      instagram: data.instagram ?? '',
      spotify: data.spotify ?? '',
      youtube: data.youtube ?? '',
      soundcloud: data.soundcloud ?? '',
      website: data.website ?? '',
    },
    ...(data.sex ? { sex: data.sex } : {}),
  };

  let res;
  try {
    res = await api.put<BackendEnvelope<UploadedUserData>>(Endpoints.users.update, dto);
  } catch (err: any) {
    throw err;
  }

  const saved = res.data.data;

  return {
    displayName: saved?.displayName || data.displayName,
    username: saved?.username || data.username,
    avatarUrl: saved?.profilePicture ?? profilePicture ?? undefined,
    bannerUrl: saved?.profileBanner ?? profileBanner ?? undefined,
    bio: data.bio,
    objective: data.objective,
    skills: normalizeSkills(data.skills),
    musicGenres: normalizeMusicGenres(data.musicGenres),
    sex: data.sex,
    city: data.city,
    state: data.state,
    country: data.country,
    instagram: data.instagram,
    spotify: data.spotify,
    youtube: data.youtube,
    soundcloud: data.soundcloud,
    website: data.website,
    photos: saved?.photosCard ?? photosCard,
  };
}
