/**
 * useProfileEditViewModel — ViewModel
 * Gerencia todo o estado e lógica da tela de edição de perfil.
 *
 * Serve para dois contextos:
 *  - Onboarding (needsOnboarding=true): após salvar/pular, libera acesso ao Main.
 *  - Edição normal (needsOnboarding=false): salva e volta para a tela anterior.
 */

import { useState, useEffect } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import type { RootStackParamList } from '@/navigation/types';
import { saveProfile, fetchMyProfile } from '../services/profileEditService';
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
  sex: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

export type ProfileEditFormData = z.infer<typeof schema>;

export const PROFILE_EDIT_TABS: TabItem[] = [
  { key: 'tudo', label: 'Tudo' },
  { key: 'card', label: 'Card' },
  { key: 'colaboracoes', label: 'Colaborações' },
];

export function useProfileEditViewModel() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const { user, needsOnboarding, setNeedsOnboarding, setUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tudo');
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showGenresModal, setShowGenresModal] = useState(false);
  const [showBioObjectiveModal, setShowBioObjectiveModal] = useState(false);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
  const onScrollAreaLayout = (e: LayoutChangeEvent) =>
    setScrollAreaHeight(e.nativeEvent.layout.height);

  // Mídia — inicializa com dados já conhecidos (authStore) para exibição imediata
  const [localAvatarUri, setLocalAvatarUri] = useState<string | undefined>(user?.avatarUrl);
  const [bannerUri, setBannerUri] = useState<string | undefined>(user?.bannerUrl);
  const [photos, setPhotos] = useState<string[]>(user?.photos ?? []);

  // defaultValues já populam do authStore — dados imediatos sem esperar API
  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: user?.displayName  ?? '',
      username:    user?.username     ?? '',
      bio:         user?.bio          ?? '',
      objective:   user?.objective    ?? '',
      skills:      user?.skills       ?? [],
      musicGenres: user?.musicGenres  ?? [],
      sex:         user?.sex          ?? undefined,
      city:        user?.city         ?? '',
      state:       user?.state        ?? '',
      country:     user?.country      ?? '',
      instagram:   user?.instagram    ?? '',
      spotify:     user?.spotify      ?? '',
      youtube:     user?.youtube      ?? '',
      soundcloud:  user?.soundcloud   ?? '',
      website:     user?.website      ?? '',
    },
  });

  // Busca do backend APENAS no modo edição — onboarding começa com form vazio
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['my-profile-edit'],
    queryFn: fetchMyProfile,
    enabled: !needsOnboarding,
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (!profileData) return;
    // || em vez de ?? para strings/arrays: backend vazio não apaga dados do authStore
    form.reset({
      displayName: profileData.displayName            || user?.displayName  || '',
      username:    profileData.username               || user?.username     || '',
      bio:         profileData.bio                    || user?.bio          || '',
      objective:   profileData.objective              || user?.objective    || '',
      skills:      profileData.instruments?.length    ? profileData.instruments    : (user?.skills      ?? []),
      musicGenres: profileData.genres?.length         ? profileData.genres         : (user?.musicGenres ?? []),
      sex:         profileData.sex                    ?? user?.sex          ?? undefined,
      city:        profileData.location?.city         || user?.city         || '',
      state:       profileData.location?.state        || user?.state        || '',
      country:     profileData.location?.country      || user?.country      || '',
      instagram:   profileData.links?.instagram       || user?.instagram    || '',
      spotify:     profileData.links?.spotify         || user?.spotify      || '',
      youtube:     profileData.links?.youtube         || user?.youtube      || '',
      soundcloud:  profileData.links?.soundcloud      || user?.soundcloud   || '',
      website:     profileData.links?.website         || user?.website      || '',
    });
    // Imagens: backend tem prioridade, authStore é fallback
    setLocalAvatarUri(profileData.profilePicture || user?.avatarUrl);
    setBannerUri(profileData.profileBanner       || user?.bannerUrl);
    if (profileData.photosCard?.length) setPhotos(profileData.photosCard);
    else if (user?.photos?.length)      setPhotos(user.photos);
  }, [profileData]);

  const { watch, setValue } = form;
  const displayNameValue = watch('displayName');
  const selectedSkills = watch('skills');
  const selectedGenres = watch('musicGenres');
  const bioValue = watch('bio');
  const objectiveValue = watch('objective');
  const selectedSex = watch('sex');

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
      const saved = await saveProfile(data, {
        avatarUri: localAvatarUri,
        bannerUri,
        photoUris: photos,
      });
      // Persiste os dados do perfil no authStore para o perfil público usar como fallback
      if (user) {
        setUser({
          ...user,
          displayName: saved.displayName  || user.displayName,
          username:    saved.username     || user.username,
          avatarUrl:   saved.avatarUrl    ?? user.avatarUrl,
          bannerUrl:   saved.bannerUrl,
          bio:         saved.bio,
          objective:   saved.objective,
          skills:      saved.skills,
          musicGenres: saved.musicGenres,
          sex:         saved.sex,
          city:        saved.city,
          state:       saved.state,
          country:     saved.country,
          instagram:   saved.instagram,
          spotify:     saved.spotify,
          youtube:     saved.youtube,
          soundcloud:  saved.soundcloud,
          website:     saved.website,
          photos:      saved.photos,
        });
      }
      // Invalida caches para garantir dados frescos nas próximas aberturas
      queryClient.invalidateQueries({ queryKey: ['my-profile-edit'] });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      if (needsOnboarding) {
        setNeedsOnboarding(false);
      } else {
        navigation.goBack();
      }
    } catch {
      setErrorMessage('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  });

  const handleSkip = () => {
    if (needsOnboarding) setNeedsOnboarding(false);
  };

  // Navegação do header — usa RootStack porque ProfileEdit vive fora do Tab navigator
  const handleHeaderSettings = () => navigation.navigate('Settings');
  const handleHeaderNotifications = () =>
    navigation.navigate('Main', { screen: 'Notifications' });

  return {
    form,
    handleSave,
    handleSkip,
    isLoading,
    errorMessage,
    isProfileLoading,
    isOnboarding: needsOnboarding,
    handleHeaderSettings,
    handleHeaderNotifications,
    displayName: displayNameValue ?? user?.displayName ?? '',
    avatarUri: localAvatarUri ?? user?.avatarUrl,
    bioValue,
    objectiveValue,
    selectedSex,
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
