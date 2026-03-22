export interface ProfileBannerProps {
  bannerUri?: string;
  avatarUri?: string;
  displayName: string;
  onBannerPress?: () => void;
  onAvatarPress?: () => void;
  editable?: boolean;
}
