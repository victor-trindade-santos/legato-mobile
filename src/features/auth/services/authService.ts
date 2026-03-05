import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import type { LoginDTO, RegisterDTO, ResetPasswordDTO, AuthResponse } from '../models/AuthDTO';

export async function loginUser(data: LoginDTO): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>(Endpoints.auth.login, data);
  return res.data;
}

export async function registerUser(data: RegisterDTO): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>(Endpoints.auth.register, data);
  return res.data;
}

export async function resetPassword(data: ResetPasswordDTO): Promise<void> {
  await api.post(Endpoints.auth.resetPassword, data);
}
