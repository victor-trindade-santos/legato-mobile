import { TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'outline_gray' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?:  StyleProp<ViewStyle>;
}
