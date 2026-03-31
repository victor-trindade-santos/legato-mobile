import type { AuthUser } from '@/store/authStore';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  username: string;
  displayName: string;
  /** Formato ISO: YYYY-MM-DD */
  birthDate: string;
  role: 'USER';
  /** Enviado como string vazia quando reCAPTCHA está desativado no backend */
  recaptchaToken: string;
}

export interface ResetPasswordDTO {
  email: string;
}

/** Campos do user retornados pelo backend dentro de data.user */
export interface BackendUserDTO {
  id: number;
  email: string;
  username: string;
  displayName: string;
  profilePicture: string | null;
}

/** Formato envelope: register → { success, message, data: { token, user } } */
export interface AuthResponseEnvelope {
  success?: boolean;
  message?: string;
  data?: {
    token: string;
    user: BackendUserDTO;
  };
  /** Formato flat do login: token e user no nível raiz */
  token?: string;
  user?: BackendUserDTO;
}

/** Modelo interno após mapeamento pelo service */
export interface AuthResponse {
  token: string;
  user: AuthUser;
}
