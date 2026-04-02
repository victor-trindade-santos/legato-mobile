import { AuthUser } from '@/store/authStore';

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

export interface AuthResponse {
 data: {
    token: string;
    user: AuthUser;
  };
}
