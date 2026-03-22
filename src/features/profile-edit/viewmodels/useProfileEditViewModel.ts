/**
 * useProfileEditViewModel — ViewModel
 * Gerencia o formulário de edição do perfil próprio.
 *
 * Serve para dois contextos:
 *  - Onboarding (needsOnboarding=true): após salvar/pular, libera acesso ao Main.
 *  - Edição normal (needsOnboarding=false): salva e permanece na tela.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { saveProfile } from '../services/profileEditService';

const schema = z.object({
  displayName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
  bio: z.string().max(300, 'Máximo 300 caracteres').optional(),
  skills: z.array(z.string()),
  musicGenres: z.array(z.string()),
  instagram: z.string().optional(),
  spotify: z.string().optional(),
  youtube: z.string().optional(),
  soundcloud: z.string().optional(),
  website: z.string().optional(),
});

export type ProfileEditFormData = z.infer<typeof schema>;

export function useProfileEditViewModel() {
  const { user, needsOnboarding, setNeedsOnboarding } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      username: user?.username ?? '',
      bio: '',
      skills: [],
      musicGenres: [],
      instagram: '',
      spotify: '',
      youtube: '',
      soundcloud: '',
      website: '',
    },
  });

  const handleSave = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await saveProfile({
        displayName: data.displayName,
        username: data.username,
        bio: data.bio || undefined,
        skills: data.skills,
        musicGenres: data.musicGenres,
        socialLinks: {
          instagram: data.instagram || undefined,
          spotify: data.spotify || undefined,
          youtube: data.youtube || undefined,
          soundcloud: data.soundcloud || undefined,
          website: data.website || undefined,
        },
      });
      if (needsOnboarding) setNeedsOnboarding(false);
    } catch {
      setErrorMessage('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  });

  const handleSkip = () => {
    if (needsOnboarding) setNeedsOnboarding(false);
  };

  return {
    form,
    handleSave,
    handleSkip,
    isLoading,
    errorMessage,
    isOnboarding: needsOnboarding,
    displayName: user?.displayName ?? '',
    avatarUri: user?.avatarUrl,
  };
}
