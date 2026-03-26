/**
 * useProfileEditViewModel — ViewModel
 * Gerencia todo o estado e lógica da tela de edição de perfil.
 *
 * Serve para dois contextos:
 *  - Onboarding (needsOnboarding=true): após salvar/pular, libera acesso ao Main.
 *  - Edição normal (needsOnboarding=false): salva e permanece na tela.
 */

import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { saveProfile } from '../services/profileEditService';
import { mediaUpload } from '@/utils/mediaUpload';
import type { TabItem } from '@/components/molecules/TabBar/TabBar.types';

const schema = z.object({
  displayName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
  bio: z.string().max(300, 'Máximo 300 caracteres').optional(),
  objective: z.string().max(200, 'Máximo 200 caracteres').optional(),
  skills: z.array(z.string()),
  musicGenres: z.array(z.string()),
  instagram: z.string().optional(),
  spotify: z.string().optional(),
  youtube: z.string().optional(),
  soundcloud: z.string().optional(),
  website: z.string().optional(),
});

export type ProfileEditFormData = z.infer<typeof schema>;

export const PROFILE_EDIT_TABS: TabItem[] = [
  { key: 'tudo', label: 'Tudo' },
  { key: 'card', label: 'Card' },
  { key: 'colaboracoes', label: 'Colaborações' },
];

export function useProfileEditViewModel() {
  const { user, needsOnboarding, setNeedsOnboarding } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tudo');
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showGenresModal, setShowGenresModal] = useState(false);
  const [showBioObjectiveModal, setShowBioObjectiveModal] = useState(false);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
  const onScrollAreaLayout = (e: LayoutChangeEvent) =>
    setScrollAreaHeight(e.nativeEvent.layout.height);

  // Mídia — URIs locais antes do upload real ao backend
  const [localAvatarUri, setLocalAvatarUri] = useState<string | undefined>(undefined);
  const [bannerUri, setBannerUri] = useState<string | undefined>(undefined);
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      username: user?.username ?? '',
      bio: '',
      objective: '',
      skills: [],
      musicGenres: [],
      instagram: '',
      spotify: '',
      youtube: '',
      soundcloud: '',
      website: '',
    },
  });

  const { watch, setValue } = form;
  const selectedSkills = watch('skills');
  const selectedGenres = watch('musicGenres');
  const bioValue = watch('bio');
  const objectiveValue = watch('objective');

  const removeSkill = (skill: string) =>
    setValue('skills', selectedSkills.filter((s) => s !== skill), { shouldValidate: true });

  const removeGenre = (genre: string) =>
    setValue('musicGenres', selectedGenres.filter((g) => g !== genre), { shouldValidate: true });

  const confirmSkills = (items: string[]) =>
    setValue('skills', items, { shouldValidate: true });

  const confirmGenres = (items: string[]) =>
    setValue('musicGenres', items, { shouldValidate: true });

  // ── Handlers de mídia ─────────────────────────────────────────────────

  const handlePickAvatar = async () => {
    const uri = await mediaUpload.pickImage([1, 1]);
    if (uri) setLocalAvatarUri(uri);
  };

  const handlePickBanner = async () => {
    const uri = await mediaUpload.pickImage([16, 9]);
    if (uri) setBannerUri(uri);
  };

  const handlePickPhoto = async () => {
    if (photos.length >= 4) return;
    const uri = await mediaUpload.pickImage([1, 1]);
    if (uri) setPhotos((prev) => [...prev, uri]);
  };

  const removePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleSave = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await saveProfile({
        displayName: data.displayName,
        username: data.username,
        bio: data.bio || undefined,
        objective: data.objective || undefined,
        bannerUrl: bannerUri,
        photos: photos.length > 0 ? photos : undefined,
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
    avatarUri: localAvatarUri ?? user?.avatarUrl,
    bioValue,
    objectiveValue,
    // tabs
    tabs: PROFILE_EDIT_TABS,
    activeTab,
    setActiveTab,
    // modais
    showSkillsModal,
    openSkillsModal: () => setShowSkillsModal(true),
    closeSkillsModal: () => setShowSkillsModal(false),
    showGenresModal,
    openGenresModal: () => setShowGenresModal(true),
    closeGenresModal: () => setShowGenresModal(false),
    showBioObjectiveModal,
    openBioObjectiveModal: () => setShowBioObjectiveModal(true),
    closeBioObjectiveModal: () => setShowBioObjectiveModal(false),
    // tags
    selectedSkills,
    selectedGenres,
    removeSkill,
    removeGenre,
    confirmSkills,
    confirmGenres,
    // mídia
    bannerUri,
    photos,
    handlePickAvatar,
    handlePickBanner,
    handlePickPhoto,
    removePhoto,
    // layout
    scrollAreaHeight,
    onScrollAreaLayout,
  };
}
