/**
 * profileEditService — Service
 * Chamadas HTTP para edição do próprio perfil.
 */

import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Config } from '@/constants/config';
import type { ProfileEditPayload } from '../models/ProfileEdit';

export async function saveProfile(payload: ProfileEditPayload): Promise<void> {
  if (Config.DEV_USE_MOCK) return;
  await api.put(Endpoints.musicians.updateProfile, payload);
}
