/**
 * ProfileBanner — Molecule
 *
 * Banner (capa) + Avatar circular sobrepostos, com ação de upload.
 * Reutilizável em ProfileEdit e futuramente em ProfileScreen.
 *
 * Props:
 *  - editable: exibe os ícones de câmera para substituição de mídia
 *  - onBannerPress / onAvatarPress: callbacks de upload
 */

import React from 'react';
import { View, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { Colors, Spacing, BorderRadius, Shadows } from '@/theme';
import type { ProfileBannerProps } from './ProfileBanner.types';

const BANNER_HEIGHT = 160;
const AVATAR_SIZE_PX = 80;
const AVATAR_OFFSET = AVATAR_SIZE_PX / 2;

const placeholderBanner = require('@/assets/images/BACKGROUND_SPLASH.png');

export function ProfileBanner({
  bannerUri,
  avatarUri,
  displayName,
  onBannerPress,
  onAvatarPress,
  editable = false,
}: ProfileBannerProps) {
  return (
    <View style={styles.root}>
      {/* Banner */}
      <TouchableOpacity
        activeOpacity={editable ? 0.7 : 1}
        onPress={editable ? onBannerPress : undefined}
        style={styles.bannerWrapper}
      >
        <ImageBackground
          source={bannerUri ? { uri: bannerUri } : placeholderBanner}
          style={styles.banner}
          resizeMode="cover"
        >
          <View style={styles.bannerOverlay} />
          {editable && (
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera-outline" size={Spacing.iconLg} color={Colors.white} />
            </View>
          )}
        </ImageBackground>
      </TouchableOpacity>

      {/* Avatar — sobreposto ao banner */}
      <View style={styles.avatarWrapper}>
        <TouchableOpacity
          activeOpacity={editable ? 0.7 : 1}
          onPress={editable ? onAvatarPress : undefined}
          style={[styles.avatarFrame, Shadows.md]}
        >
          <Avatar uri={avatarUri} size="xl" fallbackInitials={displayName} />
          {editable && (
            <View style={styles.avatarCamera}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Espaço abaixo para o avatar não ser cortado */}
      <View style={{ height: AVATAR_OFFSET }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: Spacing.md,
  },
  bannerWrapper: {
    width: '100%',
    height: BANNER_HEIGHT,
  },
  banner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  cameraOverlay: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.pill,
    backgroundColor: `${Colors.backgroundDark}99`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -AVATAR_OFFSET,
    left: Spacing.screenPaddingH,
  },
  avatarFrame: {
    borderWidth: 3,
    borderColor: Colors.backgroundDark,
    borderRadius: BorderRadius.pill,
  },
  avatarCamera: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.backgroundDark,
  },
});
