import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import type { LoginDTO, RegisterDTO, ResetPasswordDTO, AuthResponse, AuthResponseEnvelope, RegisterResponse } from '../models/AuthDTO';

/**
 * Mapeia a resposta do backend para AuthResponse.
 * Suporta dois formatos:
 *   - Flat (login):    { token, user }
 *   - Envelope (register): { success, message, data: { token, user } }
 */
function mapEnvelope(res: AuthResponseEnvelope): AuthResponse {
  const rawToken = res.data?.token ?? res.token;
  const rawUser  = res.data?.user  ?? res.user;

  if (!rawToken || !rawUser) {
    throw new Error('Resposta de autenticação inválida');
  }

  return {
    data: {
      token: rawToken,
      user: {
        id: rawUser.id,
        email: rawUser.email,
        username: rawUser.username,
        displayName: rawUser.displayName,
        avatarUrl: rawUser.profilePicture ?? undefined,
        role: 'USER',
      },
    }

  };
}

export async function loginUser(data: LoginDTO): Promise<AuthResponse> {
  const res = await api.post<AuthResponseEnvelope>(Endpoints.auth.login, data);
  return mapEnvelope(res.data);
}

export async function registerUser(data: RegisterDTO): Promise<RegisterResponse> {
  const res = await api.post<AuthResponseEnvelope>(Endpoints.auth.register, data);
  return {
    message:
      res.data?.message ??
      'Usuário cadastrado! Verifique seu e-mail para confirmar a conta antes de logar.',
  };
}

export async function resetPassword(data: ResetPasswordDTO): Promise<void> {
  await api.post(Endpoints.auth.resetPassword, data);
}
