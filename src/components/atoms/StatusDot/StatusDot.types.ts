export type StatusDotVariant =
  | 'online'
  | 'offline'
  | 'away'
  | 'busy';

export interface StatusDotProps {
  size?: number;
  variant?: StatusDotVariant;
}