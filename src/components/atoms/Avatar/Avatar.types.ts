export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  uri?: string | null;
  size?: AvatarSize;
  fallbackInitials?: string;
}
