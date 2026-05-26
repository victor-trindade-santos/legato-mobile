export interface ImageViewerModalProps {
  visible: boolean;
  imageUrl: string;
  senderName: string;
  timestamp?: string;
  statusText?: string;
  onClose: () => void;
}
