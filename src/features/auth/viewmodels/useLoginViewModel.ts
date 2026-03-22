/**
 * useLoginViewModel — ViewModel
 *
 * Gerencia o estado e lógica da tela de Login.
 * View (LoginScreen) apenas consome este hook.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { storage } from '@/utils/storage';
import { loginUser } from '../services/authService';
import { useAuthStore } from '@/store/authStore';
import { Config } from '@/constants/config';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function useLoginViewModel() {
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleLogin = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await loginUser(data);
      await storage.setItem(Config.TOKEN_KEY, response.token);
      setAuth(response.token, response.user);
    } catch {
      setErrorMessage('Usuário ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  });

  return { form, handleLogin, isLoading, errorMessage };
}
