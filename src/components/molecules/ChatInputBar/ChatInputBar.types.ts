export interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  onMic?: () => void;
  onEmoji?: () => void;
  placeholder?: string;
  isRecording?: boolean;
  recordingDurationMs?: number;
  onCancelRecording?: () => void;
}