import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/theme';
import { LegatoText } from '@/components/atoms/Text/Text';
import type { AudioPlayerBarProps } from './AudioPlayerBar.types';

const MEDIA_WIDTH = 220;

const formatSeconds = (secs: number): string => {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function AudioPlayerBar({ uri, durationMs }: AudioPlayerBarProps) {
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
      // Unload previous sound if any
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

  return (
    <View style={styles.container}>
      {/* Play / Pause button */}
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
          color={Colors.white}
        />
      </TouchableOpacity>

      {/* Progress track */}
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

      {/* Time display */}
      <LegatoText variant="bodySmall" color={Colors.textSubtext}>
        {formatSeconds(positionMs / 1000)}/{formatSeconds(totalMs / 1000)}
      </LegatoText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: MEDIA_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.0)',
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
});
