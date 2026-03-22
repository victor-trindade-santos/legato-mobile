/**
 * useSignupViewModel — ViewModel
 * Gerencia o estado e lógica da tela de Cadastro.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { storage } from '@/utils/storage';
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
  birthDate: z
    .string()
    .min(10, 'Informe sua data de nascimento')
    .refine((val) => {
      const [mm, dd, yyyy] = val.split('/');
      if (!mm || !dd || !yyyy || yyyy.length !== 4) return false;
      const date = new Date(`${yyyy}-${mm}-${dd}`);
      return !isNaN(date.getTime());
    }, 'Data inválida')
    .refine((val) => {
      const [mm, dd, yyyy] = val.split('/');
      const birth = new Date(`${yyyy}-${mm}-${dd}`);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age >= 18;
    }, 'Você deve ter 18 anos ou mais para se cadastrar'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function useSignupViewModel() {
  const { setAuth, setNeedsOnboarding } = useAuthStore();
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
      birthDate: '',
    },
  });

  const handleSignup = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Converte MM/DD/YYYY (input do usuário) → YYYY-MM-DD (formato esperado pelo backend)
      const [mm, dd, yyyy] = data.birthDate.split('/');
      const isoDate = `${yyyy}-${mm}-${dd}`;

      const response = await registerUser({
        email: data.email,
        password: data.password,
        username: data.username,
        displayName: data.displayName,
        birthDate: isoDate,
        role: 'USER',
        recaptchaToken: '',
      });
      await storage.setItem(Config.TOKEN_KEY, response.token);
      setNeedsOnboarding(true);
      setAuth(response.token, response.user);
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      setErrorMessage(msg ?? 'Erro ao criar conta. Este e-mail já pode estar em uso.');
    } finally {
      setIsLoading(false);
    }
  });

  return { form, handleSignup, isLoading, errorMessage, successMessage };
}
