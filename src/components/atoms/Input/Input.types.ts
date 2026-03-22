import { TextInputProps } from 'react-native';

export type InputVariant = 'light' | 'dark';

export interface InputProps extends TextInputProps {
  hasError?: boolean;
  isPassword?: boolean;
  variant?: InputVariant;
}
