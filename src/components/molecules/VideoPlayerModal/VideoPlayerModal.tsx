/**
 * VideoPlayerModal — Molecule
 *
 * Player de vídeo fullscreen, estilo WhatsApp/Instagram.
 *
 * Gestos suportados:
 *  - Pan vertical  → swipe down/up para fechar
 *  - Tap na tela   → mostra/esconde controles (auto-hide 3s)
 *
 * Controles:
 *  - Play/Pause (centro)
 *  - Barra de progresso scrubável (bottom)
 *  - Barra vertical de volume (esquerda, scrubável)
 *  - Mute/Unmute (toque no ícone do alto falante)
 *  - Tempo atual / duração total (bottom direita)
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing } from '@/theme';
import { LegatoText } from '@/components/atoms/Text/Text';
import { TimestampText } from '@/components/atoms/TimestampText/TimestampText';
import type { VideoPlayerModalProps } from './VideoPlayerModal.types';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 800;
const CONTROLS_HIDE_DELAY = 3000;
const VOLUME_TRACK_H = 56;
const DOUBLE_TAP_DELAY = 300;
const VOLUME_BAR_HIDE_DELAY = 2000;
const HEADER_TOP = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 8;

const smooth = (duration = 220) =>
  ({ duration, easing: Easing.out(Easing.quad) } as const);

const formatSeconds = (secs: number): string => {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export function VideoPlayerModal({
  visible,
  mediaUrl,
  senderName,
  timestamp,
  onClose,
}: VideoPlayerModalProps) {
  // ── Player ─────────────────────────────────────────────────────────────────
  const player = useVideoPlayer(visible && mediaUrl ? mediaUrl : null, (p) => {
    p.loop = false;
  });

  // ── State ──────────────────────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [volumeBarVisible, setVolumeBarVisible] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrubbingRef = useRef(false);
  const isVolumeScrubbingRef = useRef(false);
  const lastVolumeRef = useRef(1);
  const lastSpeakerTapRef = useRef(0);

  // ── Shared values ──────────────────────────────────────────────────────────
  const backdropOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const controlsOpacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.9);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      controlsOpacity.value = withTiming(0, smooth(200));
      setControlsVisible(false);
    }, CONTROLS_HIDE_DELAY);
  }, []);

  const showControls = useCallback((autoHide = true) => {
    controlsOpacity.value = withTiming(1, smooth(200));
    setControlsVisible(true);
    if (autoHide) scheduleHide();
  }, [scheduleHide]);

  const scheduleVolumeBarHide = useCallback(() => {
    if (volumeHideTimerRef.current) clearTimeout(volumeHideTimerRef.current);
    volumeHideTimerRef.current = setTimeout(() => {
      setVolumeBarVisible(false);
    }, VOLUME_BAR_HIDE_DELAY);
  }, []);

  // ── Animação de entrada ────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    translateY.value = 0;
    scale.value = 0.9;
    backdropOpacity.value = 0;
    headerOpacity.value = 0;
    controlsOpacity.value = 0;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsMuted(false);
    setVolume(1);
    lastVolumeRef.current = 1;
    setControlsVisible(true);
    setVolumeBarVisible(false);

    backdropOpacity.value = withTiming(1, smooth(180));
    scale.value = withTiming(1, smooth(220));
    headerOpacity.value = withTiming(1, smooth(220));
    controlsOpacity.value = withTiming(1, smooth(220));

    scheduleHide();

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (volumeHideTimerRef.current) clearTimeout(volumeHideTimerRef.current);
    };
  }, [visible]);

  // ── Polling de progresso ───────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      if (isScrubbingRef.current) return;
      const ct = player.currentTime ?? 0;
      const dur = player.duration ?? 0;
      setCurrentTime(isFinite(ct) ? ct : 0);
      setDuration(isFinite(dur) ? dur : 0);
      setIsPlaying(player.playing);
      if (!isVolumeScrubbingRef.current) {
        const vol = player.volume ?? 1;
        setVolume(isFinite(vol) ? vol : 1);
        setIsMuted(player.muted ?? false);
      }
    }, 250);
    return () => clearInterval(id);
  }, [visible, player]);

  // ── Auto-hide quando pausa ─────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    if (!isPlaying) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
  }, [isPlaying, visible]);

  // ── Fechar ─────────────────────────────────────────────────────────────────
  const closeModal = useCallback(() => {
    player.pause();
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    translateY.value = withTiming(SCREEN_H, smooth(260), () => {
      backdropOpacity.value = withTiming(0, smooth(180), () => onClose());
      headerOpacity.value = withTiming(0, smooth(180));
      controlsOpacity.value = withTiming(0, smooth(180));
    });
  }, [onClose, player]);

  // ── Play / Pause ───────────────────────────────────────────────────────────
  const handlePlayPause = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
      scheduleHide();
    }
    showControls(!player.playing);
  }, [player, showControls, scheduleHide]);

  // ── Mute ───────────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (isMuted || volume === 0) {
      const restored = lastVolumeRef.current > 0 ? lastVolumeRef.current : 1;
      player.volume = restored;
      player.muted = false;
      setVolume(restored);
      setIsMuted(false);
    } else {
      player.muted = true;
      setIsMuted(true);
    }
  }, [player, isMuted, volume]);

  const handleSpeakerPress = useCallback(() => {
    const now = Date.now();
    const isDoubleTap = now - lastSpeakerTapRef.current < DOUBLE_TAP_DELAY;
    lastSpeakerTapRef.current = now;

    if (isDoubleTap) {
      toggleMute();
      if (volumeHideTimerRef.current) clearTimeout(volumeHideTimerRef.current);
      setVolumeBarVisible(false);
    } else if (volumeBarVisible) {
      if (volumeHideTimerRef.current) clearTimeout(volumeHideTimerRef.current);
      setVolumeBarVisible(false);
    } else {
      setVolumeBarVisible(true);
      scheduleVolumeBarHide();
    }
    showControls(isPlaying);
  }, [toggleMute, volumeBarVisible, isPlaying, showControls, scheduleVolumeBarHide]);

  // ── Volume ──────────────────────────────────────────────────────────────────
  const applyVolume = useCallback((locationY: number) => {
    const ratio = 1 - Math.max(0, Math.min(locationY / VOLUME_TRACK_H, 1));
    player.volume = ratio;
    setVolume(ratio);
    if (ratio > 0) {
      lastVolumeRef.current = ratio;
      if (player.muted) { player.muted = false; setIsMuted(false); }
    } else {
      player.muted = true;
      setIsMuted(true);
    }
  }, [player]);

  const handleVolumeGrant = useCallback((e: GestureResponderEvent) => {
    isVolumeScrubbingRef.current = true;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    applyVolume(e.nativeEvent.locationY);
    scheduleVolumeBarHide();
  }, [applyVolume, scheduleVolumeBarHide]);

  const handleVolumeMove = useCallback((e: GestureResponderEvent) => {
    if (!isVolumeScrubbingRef.current) return;
    applyVolume(e.nativeEvent.locationY);
  }, [applyVolume]);

  const handleVolumeRelease = useCallback((e: GestureResponderEvent) => {
    applyVolume(e.nativeEvent.locationY);
    isVolumeScrubbingRef.current = false;
    showControls(isPlaying);
    scheduleVolumeBarHide();
  }, [applyVolume, isPlaying, showControls, scheduleVolumeBarHide]);

  const handleVolumeTerminate = useCallback(() => {
    isVolumeScrubbingRef.current = false;
  }, []);

  // ── Tap na área de vídeo ───────────────────────────────────────────────────
  const handleVideoTap = useCallback(() => {
    if (controlsVisible) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      controlsOpacity.value = withTiming(0, smooth(200));
      setControlsVisible(false);
    } else {
      showControls(isPlaying);
    }
  }, [controlsVisible, isPlaying, showControls]);

  // ── Scrubbing ──────────────────────────────────────────────────────────────
  const seekTo = useCallback((locationX: number) => {
    if (progressBarWidth <= 0 || duration <= 0 || !isFinite(duration)) return;
    const ratio = Math.max(0, Math.min(locationX / progressBarWidth, 1));
    const newTime = ratio * duration;
    if (!isFinite(newTime)) return;
    player.currentTime = newTime;
    setCurrentTime(newTime);
  }, [player, progressBarWidth, duration]);

  const handleProgressGrant = useCallback((e: GestureResponderEvent) => {
    isScrubbingRef.current = true;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    seekTo(e.nativeEvent.locationX);
  }, [seekTo]);

  const handleProgressMove = useCallback((e: GestureResponderEvent) => {
    if (!isScrubbingRef.current || progressBarWidth <= 0 || duration <= 0 || !isFinite(duration)) return;
    const ratio = Math.max(0, Math.min(e.nativeEvent.locationX / progressBarWidth, 1));
    setCurrentTime(ratio * duration);
  }, [progressBarWidth, duration]);

  const handleProgressRelease = useCallback((e: GestureResponderEvent) => {
    seekTo(e.nativeEvent.locationX);
    isScrubbingRef.current = false;
    showControls(isPlaying);
  }, [seekTo, isPlaying, showControls]);

  const handleProgressTerminate = useCallback(() => {
    isScrubbingRef.current = false;
  }, []);

  // ── Gesto swipe-to-close ───────────────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
      backdropOpacity.value = Math.min(
        1,
        Math.max(0, 1 - Math.abs(e.translationY) / 350)
      );
    })
    .onEnd((e) => {
      const shouldClose =
        Math.abs(e.translationY) > CLOSE_DISTANCE ||
        Math.abs(e.velocityY) > CLOSE_VELOCITY;

      if (shouldClose) {
        const dir = e.translationY >= 0 ? 1 : -1;
        translateY.value = withTiming(dir * SCREEN_H, smooth(220), () => {
          backdropOpacity.value = withTiming(0, smooth(180), () => onClose());
          headerOpacity.value = withTiming(0, smooth(180));
          controlsOpacity.value = withTiming(0, smooth(180));
        });
      } else {
        translateY.value = withTiming(0, smooth(250));
        backdropOpacity.value = withTiming(1, smooth(200));
      }
    });

  // ── Estilos animados ───────────────────────────────────────────────────────
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  const videoWrapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // ── Computed ────────────────────────────────────────────────────────────────
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const volumeDisplay = isMuted ? 0 : volume;
  const volumeIcon = isMuted || volume === 0
    ? 'volume-mute'
    : volume > 0.5 ? 'volume-high' : 'volume-medium';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <View style={styles.root}>
        {/* ── Background ──────────────────────────────────────────────── */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.bg, backdropStyle]} />

        {/* ── Vídeo + swipe-to-close ──────────────────────────────────── */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[StyleSheet.absoluteFill, videoWrapStyle]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleVideoTap}
            >
              <VideoView
                player={player}
                style={styles.video}
                nativeControls={false}
                contentFit="contain"
              />
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>

        {/* ── Controles ────────────────────────────────────────────────── */}
        <Animated.View
          style={[styles.controlsOverlay, controlsStyle]}
          pointerEvents={controlsVisible ? 'box-none' : 'none'}
        >
          {/* Play / Pause centro */}
          <TouchableOpacity
            style={styles.playPauseBtn}
            onPress={handlePlayPause}
            activeOpacity={0.8}
            hitSlop={16}
          >
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={64}
              color={Colors.white}
            />
          </TouchableOpacity>

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            {/* Alto falante + barra vertical de volume */}
            <View style={styles.volumeGroup}>
              {volumeBarVisible && (
                <View
                  style={styles.volumeBarContainer}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderTerminationRequest={() => false}
                  onResponderGrant={handleVolumeGrant}
                  onResponderMove={handleVolumeMove}
                  onResponderRelease={handleVolumeRelease}
                  onResponderTerminate={handleVolumeTerminate}
                >
                  <View style={styles.volumeTrack}>
                    <View style={[styles.volumeFill, { height: `${volumeDisplay * 100}%` as any }]} />
                    <View style={[styles.volumeThumb, { bottom: `${volumeDisplay * 100}%` as any }]} />
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSpeakerPress}
                hitSlop={12}
                activeOpacity={0.7}
              >
                <Ionicons name={volumeIcon} size={22} color={Colors.white} />
              </TouchableOpacity>
            </View>

            {/* Barra de progresso */}
            <View
              style={styles.progressContainer}
              onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              onResponderGrant={handleProgressGrant}
              onResponderMove={handleProgressMove}
              onResponderRelease={handleProgressRelease}
              onResponderTerminate={handleProgressTerminate}
            >
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
              </View>
            </View>

            {/* Tempo */}
            <LegatoText variant="bodySmall" color={Colors.textSubtext}>
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </LegatoText>
          </View>
        </Animated.View>

        {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerInfo}>
            <LegatoText variant="bodyMedium" color={Colors.white}>
              {senderName}
            </LegatoText>
            <TimestampText color={Colors.textSubtext} align="left">
              {timestamp}
            </TimestampText>
          </View>

          <TouchableOpacity
            onPress={closeModal}
            hitSlop={12}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bg: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  video: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
  },
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 48 : 32,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 24,
  },
  progressContainer: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.white,
    marginLeft: -6,
  },
  header: {
    position: 'absolute',
    top: HEADER_TOP,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  volumeGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  volumeBarContainer: {
    width: 24,
    height: VOLUME_TRACK_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeTrack: {
    width: 3,
    height: VOLUME_TRACK_H,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'visible',
    justifyContent: 'flex-end',
  },
  volumeFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  volumeThumb: {
    position: 'absolute',
    left: -5,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.white,
    marginBottom: -6,
  },
});
