import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

export async function downloadFile(url: string, fileName: string, headers?: Record<string, string>): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(url, { headers });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(objectUrl);
    return;
  }

  const dest = (FileSystem.cacheDirectory ?? '') + fileName;
  try {
    const { uri } = await FileSystem.downloadAsync(url, dest, headers ? { headers } : undefined);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { dialogTitle: fileName });
    } else {
      Alert.alert('Arquivo salvo', `Arquivo disponível em: ${uri}`);
    }
  } catch {
    Alert.alert('Erro', 'Não foi possível baixar o arquivo.');
  }
}
