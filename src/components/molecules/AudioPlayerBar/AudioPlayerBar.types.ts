export interface AudioPlayerBarProps {
  uri: string;
  durationMs?: number;
  audioType?: 'voice' | 'audio_file';
  fileName?: string;
  isMine?: boolean;
}
