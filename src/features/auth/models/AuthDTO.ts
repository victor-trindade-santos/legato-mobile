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
  role: 'USER';
}

export interface ResetPasswordDTO {
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
