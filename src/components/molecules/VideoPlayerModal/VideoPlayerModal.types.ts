export interface VideoPlayerModalProps {
  visible: boolean;
  mediaUrl: string;
  senderName: string;
  timestamp: string;
  onClose: () => void;
}
