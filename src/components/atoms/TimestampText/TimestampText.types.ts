import { TextProps as RNTextProps } from 'react-native';

export interface TimestampTextProps extends RNTextProps {
  color?: string;
  align?: 'left' | 'center' | 'right';
}