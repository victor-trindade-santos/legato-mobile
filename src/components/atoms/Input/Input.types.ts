import { TextInputProps, ViewStyle, StyleProp, TextStyle } from 'react-native';

export type InputVariant = 'light' | 'dark';

export interface InputProps extends TextInputProps {
  hasError?: boolean;
  isPassword?: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  placeholder?: string;
  variant?: InputVariant;
}
