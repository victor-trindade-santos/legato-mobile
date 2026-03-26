/**
 * mediaUpload — adapter de seleção de mídia cross-platform
 *
 * Native (iOS/Android) → expo-image-picker com permissão de galeria
 * Web (Expo web)       → expo-image-picker usa <input type="file"> internamente
 *
 * Padrão similar ao storage.ts: uma função por operação, switch de plataforma isolado.
 */

import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const mediaUpload = {
  /**
   * Abre o seletor de imagem da galeria.
   * Retorna a URI local da imagem selecionada, ou null se cancelado/sem permissão.
   *
   * @param aspectRatio - [largura, altura] para crop; padrão [1,1] (quadrado)
   */
  async pickImage(aspectRatio: [number, number] = [1, 1]): Promise<string | null> {
    // Permissão só é necessária no native; no web o browser gerencia
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 0.85,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  },
};
