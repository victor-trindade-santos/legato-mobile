import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Icon } from '@/components/atoms/Icon/Icon';
import type { AudioPlayerBarProps } from './AudioPlayerBar.types';

const MEDIA_WIDTH = 220;

const formatSeconds = (secs: number): string => {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function AudioPlayerBar({ uri, durationMs, audioType = 'voice', fileName, isMine = true }: AudioPlayerBarProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const isScrubbingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [totalMs, setTotalMs] = useState(durationMs ?? 0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load / unload sound when uri changes
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (soundRef.current) {
        try { await soundRef.current.unloadAsync(); } catch {}
        soundRef.current = null;
      }
      setIsLoaded(false);
      setIsPlaying(false);
      setPositionMs(0);

      try {
        const { sound, status } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false },
        );
        if (!mounted) {
          sound.unloadAsync().catch(() => {});
          return;
        }
        soundRef.current = sound;
        if ((status as AVPlaybackStatus & { durationMillis?: number }).isLoaded) {
          const dur = (status as any).durationMillis;
          if (dur && isFinite(dur)) setTotalMs(dur);
        }
        setIsLoaded(true);
      } catch {}
    };

    load();

    return () => {
      mounted = false;
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [uri]);

  // Polling
  useEffect(() => {
    if (!isLoaded) return;

    intervalRef.current = setInterval(async () => {
      if (isScrubbingRef.current || !soundRef.current) return;
      try {
        const status = await soundRef.current.getStatusAsync() as any;
        if (!status.isLoaded) return;
        setPositionMs(status.positionMillis ?? 0);
        if (status.durationMillis && isFinite(status.durationMillis)) {
          setTotalMs(status.durationMillis);
        }
        setIsPlaying(status.isPlaying ?? false);
        if (status.didJustFinish) {
          await soundRef.current.setPositionAsync(0);
          setPositionMs(0);
          setIsPlaying(false);
        }
      } catch {}
    }, 250);

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [isLoaded]);

  const handlePlayPause = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch {}
  }, [isPlaying]);

  const seekTo = useCallback(async (locationX: number) => {
    const sound = soundRef.current;
    if (!sound || trackWidth <= 0 || totalMs <= 0) return;
    const ratio = Math.max(0, Math.min(locationX / trackWidth, 1));
    const newMs = ratio * totalMs;
    setPositionMs(newMs);
    try { await sound.setPositionAsync(newMs); } catch {}
  }, [trackWidth, totalMs]);

  const handleProgressGrant = useCallback((e: GestureResponderEvent) => {
    isScrubbingRef.current = true;
    seekTo(e.nativeEvent.locationX);
  }, [seekTo]);

  const handleProgressMove = useCallback((e: GestureResponderEvent) => {
    if (!isScrubbingRef.current || trackWidth <= 0 || totalMs <= 0) return;
    const ratio = Math.max(0, Math.min(e.nativeEvent.locationX / trackWidth, 1));
    setPositionMs(ratio * totalMs);
  }, [trackWidth, totalMs]);

  const handleProgressRelease = useCallback((e: GestureResponderEvent) => {
    seekTo(e.nativeEvent.locationX);
    isScrubbingRef.current = false;
  }, [seekTo]);

  const handleProgressTerminate = useCallback(() => {
    isScrubbingRef.current = false;
  }, []);

  const progress = totalMs > 0 ? Math.min(positionMs / totalMs, 1) : 0;
  const accentBg = isMine ? Colors.primaryHover : Colors.grayButton;
  const iconCircleBg = isMine ? Colors.primaryLight : Colors.grayButton;

  const progressTrack = (
    <View
      style={styles.trackContainer}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => isLoaded}
      onMoveShouldSetResponder={() => isLoaded}
      onResponderTerminationRequest={() => false}
      onResponderGrant={handleProgressGrant}
      onResponderMove={handleProgressMove}
      onResponderRelease={handleProgressRelease}
      onResponderTerminate={handleProgressTerminate}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
      </View>
    </View>
  );

  const playPauseButton = (
    <TouchableOpacity
      onPress={handlePlayPause}
      style={styles.playButton}
      activeOpacity={0.7}
      hitSlop={8}
      disabled={!isLoaded}
    >
      <Ionicons
        name={isPlaying ? 'pause' : 'play'}
        size={18}
        color={Colors.primary}
      />
    </TouchableOpacity>
  );

  const timeText = (
    <LegatoText variant="bodySmall" color={Colors.textSubtext}>
      {formatSeconds(positionMs / 1000)}/{formatSeconds(totalMs / 1000)}
    </LegatoText>
  );

  // ── Audio file variant ───────────────────────────────────────
  if (audioType === 'audio_file') {
    const raw = fileName ?? 'arquivo.mp3';
    const displayName = raw.length > 20 ? raw.slice(0, 17) + '...' : raw;

    return (
      <View style={styles.fileContainer}>
        <View style={styles.fileTopRow}>
          <View style={[styles.musicIconCircle, { backgroundColor: iconCircleBg }]}>
            <Icon variant="vector" family="Ionicons" name="musical-note" size={20} color={Colors.white} />
          </View>
          <LegatoText variant="bodySmall" color={Colors.textPrimaryDark} numberOfLines={1} style={styles.fileNameText}>
            {displayName}
          </LegatoText>
        </View>
        <View style={[styles.fileBottomRow , { backgroundColor: accentBg }]}>
          {playPauseButton}
          {progressTrack}
          {timeText}
        </View>
      </View>
    );
  }

  // ── Voice variant (default) ──────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.micBadge}>
        <Icon variant="vector" family="Ionicons" name="mic" size={14} color={Colors.white} />
      </View>
      <View style={[styles.voicePlayerRow, { backgroundColor: accentBg }]}>
        {playPauseButton}
        {progressTrack}
        {timeText}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── shared ────────────────────────────────────────────────────
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackContainer: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
    
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'visible',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.white,
    marginLeft: -6,
  },
  // ── voice variant ─────────────────────────────────────────────
  container: {
    width: MEDIA_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    
  },
  voicePlayerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primaryHover,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  micBadge: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── audio file variant ────────────────────────────────────────
  fileContainer: {
    width: MEDIA_WIDTH,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  fileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  musicIconCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileNameText: {
    flex: 1,
  },
  fileBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primaryHover,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,

  },
});
