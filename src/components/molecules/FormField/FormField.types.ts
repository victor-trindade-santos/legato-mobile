import type { ViewStyle, StyleProp } from 'react-native';
import { InputProps } from '@/components/atoms/Input/Input.types';

export interface FormFieldProps extends InputProps {
  label: string;
  errorMessage?: string;
  hintMessage?: string;
  isRequired?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}
