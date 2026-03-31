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
import type { ProfileEditFormData } from '../viewmodels/useProfileEditViewModel';
import type { UpdateProfileDTO, UploadImageResponse } from '../models/ProfileEditDTO';

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
  const res = await api.put<UploadImageResponse>(
    `${Endpoints.users.uploadImage}?type=${type}`,
    formData,
    { headers: { 'Content-Type': undefined } as any },
  );
  if (!res.data.success) {
    throw new Error(res.data.message ?? 'Falha no upload da imagem');
  }
  // Backend retorna o usuário atualizado — extrai o campo correto por tipo
  const url = type === 'profile'
    ? res.data.data?.profilePicture
    : res.data.data?.profileBanner;
  return url ?? '';
}

/** Envia uma foto do carrossel; retorna a URL pública do Cloudinary */
async function uploadCardPhoto(uri: string, index: number): Promise<string> {
  const formData = await buildImageFormData(uri);
  const res = await api.put<UploadImageResponse>(
    `${Endpoints.users.cardFile}?index=${index}`,
    formData,
    { headers: { 'Content-Type': undefined } as any },
  );
  if (!res.data.success) {
    throw new Error(res.data.message ?? 'Falha no upload da foto');
  }
  // Backend retorna o usuário atualizado — pega a última URL do array photosCard
  const photos = res.data.data?.photosCard ?? [];
  return photos[photos.length - 1] ?? '';
}

// ─── export ───────────────────────────────────────────────────────────────────

export async function saveProfile(
  data: ProfileEditFormData,
  media: ProfileMediaInput,
): Promise<void> {
  if (Config.DEV_USE_MOCK) return;

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
          ? uploadCardPhoto(uri, index).catch(() => uri)  // mantém URI local se upload falhar
          : uri,
      ),
  );

  // 4. Atualiza o perfil com as URLs já públicas
  const dto: UpdateProfileDTO = {
    profilePicture,
    profileBanner,
    photosCard,
    bio: data.bio ?? '',
    instruments: data.skills,
    genres: data.musicGenres,
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
      website: data.website ?? '',
    },
    ...(data.sex ? { sex: data.sex } : {}),
  };

  await api.put(Endpoints.users.update, dto);
}
