/**
 * useSignupViewModel — ViewModel
 * Gerencia o estado e lógica da tela de Cadastro.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as SecureStore from 'expo-secure-store';
import { registerUser } from '../services/authService';
import { useAuthStore } from '@/store/authStore';
import { Config } from '@/constants/config';

const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(20, 'Username pode ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
  displayName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Aceite os termos para continuar',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function useSignupViewModel() {
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const handleSignup = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await registerUser({
        email: data.email,
        password: data.password,
        username: data.username,
        displayName: data.displayName,
        role: 'USER',
      });
      await SecureStore.setItemAsync(Config.TOKEN_KEY, response.token);
      setAuth(response.token, response.user);
      setSuccessMessage('Conta criada com sucesso!');
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      setErrorMessage(msg ?? 'Erro ao criar conta. Este e-mail já pode estar em uso.');
    } finally {
      setIsLoading(false);
    }
  });

  return { form, handleSignup, isLoading, errorMessage, successMessage };
}
