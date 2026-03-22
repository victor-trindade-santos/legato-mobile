/**
 * AuthHeader — Molecule
 *
 * Logo do Legato + subtítulo para telas de autenticação.
 * Suporta variação de tema via `logoVariant` ('dark' | 'light').
 *
 * Uso:
 *   <AuthHeader subtitle="Sua música em qualquer lugar" />
 *   <AuthHeader subtitle="Recuperar senha" logoVariant="light" />
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from '@/components/atoms/Icon/Icon';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
import type { AuthHeaderProps } from './AuthHeader.types';

const LOGO_SOURCES = {
  dark: require('@/assets/icons/LEGATO_logo_horizontal_dark_version.svg'),
  light: require('@/assets/icons/legato_logo_horizontal_light_version.png'),
};

export function AuthHeader({ subtitle, logoVariant = 'dark' }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <Icon
        variant="image"
        source={LOGO_SOURCES[logoVariant]}
        width={Spacing.logoXxl}
        aspectRatio={0.6}
        resizeMode="contain"
      />
      <LegatoText variant="bodySmall" color={Colors.white} align="center">
        {subtitle}
      </LegatoText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
});
