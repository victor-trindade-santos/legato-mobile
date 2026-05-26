export interface ChatHeaderUserInfoProps {
  avatarUri?: string;
  fallbackInitials: string;
  name: string;
  statusText?: string;
  onAvatarPress?: () => void;
  onNamePress?: () => void;
}
