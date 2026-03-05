import { TextProps as RNTextProps } from 'react-native';

export type TextVariant =
  | 'displayTitle'
  | 'title'
  | 'subtitle'
  | 'sectionTitle'
  | 'body'
  | 'bodyMedium'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'overline'
  | 'buttonLg'
  | 'buttonMd'
  | 'buttonSm';

export interface LegatoTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}
