import { useEffect, useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';

export interface AudioRecorderResult {
  uri: string;
  durationMs: number;
  mimeType: string;
  fileName: string;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  recordingDurationMs: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<AudioRecorderResult | null>;
  cancelRecording: () => Promise<void>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetAudioMode = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch {}
  }, []);

  const startRecording = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return;

    try {
      // allowsRecordingIOS routes audio through mic instead of speaker on iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDurationMs(0);

      intervalRef.current = setInterval(async () => {
        try {
          const status_ = await recording.getStatusAsync();
          if (status_.isRecording) {
            setRecordingDurationMs(status_.durationMillis);
          }
        } catch {}
      }, 250);
    } catch {
      await resetAudioMode();
    }
  }, [resetAudioMode]);

  const stopRecording = useCallback(async (): Promise<AudioRecorderResult | null> => {
    console.log('[AudioRecorder] stopRecording chamado');
    clearInterval_();
    const recording = recordingRef.current;
    if (!recording) {
      console.warn('[AudioRecorder] stopRecording → sem recording ref, retornando null');
      return null;
    }

    try {
      const status = await recording.getStatusAsync();
      console.log('[AudioRecorder] status antes de parar:', status);
      const durationMs = status.durationMillis;
      await recording.stopAndUnloadAsync();

      // expo-av returns null from getURI() during recording on some platforms/versions;
      // the URI is only reliably available after stopAndUnloadAsync()
      const uri = recording.getURI();
      console.log('[AudioRecorder] URI capturada após parar:', uri);
      recordingRef.current = null;
      setIsRecording(false);
      setRecordingDurationMs(0);
      await resetAudioMode();

      if (!uri) {
        console.warn('[AudioRecorder] ⚠️ URI é null mesmo após parar gravação');
        return null;
      }

      // Web (Expo web): expo-av returns a blob: URL from the browser's MediaRecorder.
      // Native: returns a file:// path (or bare path that needs the scheme).
      const isBlobUri = uri.startsWith('blob:');

      const fileUri = isBlobUri ? uri : (uri.startsWith('file://') ? uri : `file://${uri}`);

      // blob: URLs have no extension — default to webm (Chrome/Edge) for web
      const ext = isBlobUri ? 'webm' : (uri.split('.').pop()?.toLowerCase() ?? 'm4a');
      const mimeMap: Record<string, string> = {
        m4a: 'audio/mp4',
        aac: 'audio/aac',
        '3gp': 'audio/3gpp',
        mp4: 'audio/mp4',
        amr: 'audio/amr',
        caf: 'audio/x-caf',
        webm: 'audio/webm',
      };
      const mimeType = isBlobUri ? 'audio/webm' : (mimeMap[ext] ?? 'audio/mp4');
      const fileName = `voice_${Date.now()}.${ext}`;
      console.log('[AudioRecorder] ✅ stopRecording resultado:', { uri: fileUri, durationMs, mimeType, fileName });

      return {
        uri: fileUri,
        durationMs,
        mimeType,
        fileName,
      };
    } catch (err) {
      console.error('[AudioRecorder] ❌ Exceção em stopRecording:', err);
      recordingRef.current = null;
      setIsRecording(false);
      setRecordingDurationMs(0);
      await resetAudioMode();
      return null;
    }
  }, [clearInterval_, resetAudioMode]);

  const cancelRecording = useCallback(async () => {
    clearInterval_();
    const recording = recordingRef.current;
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
    } catch {}
    recordingRef.current = null;
    setIsRecording(false);
    setRecordingDurationMs(0);
    await resetAudioMode();
  }, [clearInterval_, resetAudioMode]);

  useEffect(() => {
    return () => {
      clearInterval_();
      const recording = recordingRef.current;
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, [clearInterval_]);

  return { isRecording, recordingDurationMs, startRecording, stopRecording, cancelRecording };
}
