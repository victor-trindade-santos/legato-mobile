/**
 * LEGATO — Instância Axios com interceptors JWT
 *
 * - Injeta automaticamente o token no header Authorization
 * - Trata 401/403 para expiração de sessão
 */

import axios from 'axios';
import { storage } from '@/utils/storage';
import { Config } from '@/constants/config';

const api = axios.create({
  baseURL: Config.API_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

// Rotas públicas que não precisam de token
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

// Interceptor de Request — injeta token JWT
api.interceptors.request.use(async (config) => {
  // FormData precisa que o XHR nativo defina o Content-Type com boundary.
  // O default 'application/json' da instância quebra isso, então removemos aqui.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const isPublic = PUBLIC_ROUTES.some(route => config.url?.includes(route));
  if (!isPublic) {
    const token = await storage.getItem(Config.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor de Response — trata erros globais
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      // Token expirado — limpa sessão (authStore vai redirecionar)
      await storage.deleteItem(Config.TOKEN_KEY);
    }
    throw error;
  }
);

export default api;
