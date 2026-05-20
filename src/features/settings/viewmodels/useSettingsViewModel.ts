/**
 * useSettingsViewModel — ViewModel (Configurações)
 *
 * Gerencia estado e lógica da tela de configurações:
 *  - Tema dark/light (via uiStore)
 *  - Dados do usuário logado (via authStore)
 *  - Logout com limpeza de storage
 *  - Navegação para edição de perfil
 */

import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/types';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/utils/storage';
import { Config } from '@/constants/config';
import { useQueryClient } from '@tanstack/react-query';

type SettingsNav = StackNavigationProp<RootStackParamList, 'Settings'>;

export function useSettingsViewModel() {
  const navigation = useNavigation<SettingsNav>();
  const queryClient = useQueryClient();

  const { theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isDarkTheme = theme === 'dark';

  const handleBack = () => navigation.goBack();

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await storage.deleteItem(Config.TOKEN_KEY);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    } catch {
      // ignora erros de storage — logout prossegue de qualquer forma
    } finally {
      queryClient.clear();
      logout();
    }
  };

  const appVersion = '1.0.0';

  return {
    user,
    isDarkTheme,
    toggleTheme,
    handleBack,
    handleEditProfile,
    handleLogout,
    isLoggingOut,
    appVersion,
  };
}
