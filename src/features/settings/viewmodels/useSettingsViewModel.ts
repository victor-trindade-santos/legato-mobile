/**
 * useSettingsViewModel — ViewModel (Configurações)
 *
 * Gerencia estado e lógica da tela de configurações.
 */

import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/types';

type SettingsNav = StackNavigationProp<RootStackParamList, 'Settings'>;

export function useSettingsViewModel() {
  const navigation = useNavigation<SettingsNav>();

  const handleBack = () => navigation.goBack();

  return {
    handleBack,
  };
}
