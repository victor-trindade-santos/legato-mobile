import type { StyleProp, ViewStyle } from 'react-native';

export type DateInputVariant = 'light' | 'dark';

export interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  variant?: DateInputVariant;
  containerStyle?: StyleProp<ViewStyle>;
}
