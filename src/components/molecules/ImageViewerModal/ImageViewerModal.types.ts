export interface ImageViewerModalProps {
  visible: boolean;
  imageUrl: string;
  senderName: string;
  timestamp: string;
  onClose: () => void;
}
