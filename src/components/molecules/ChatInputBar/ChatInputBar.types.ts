export interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  onMic?: () => void;
  onEmoji?: () => void;
  placeholder?: string;
}