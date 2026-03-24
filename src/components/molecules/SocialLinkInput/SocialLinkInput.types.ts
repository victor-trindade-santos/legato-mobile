import type { Ionicons } from '@expo/vector-icons';

export interface SocialLinkInputProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  platform: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}
