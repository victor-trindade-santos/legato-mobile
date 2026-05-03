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
import LegatoIconVertical from '@/assets/icons/LEGATO_ICON_VERTICAL.svg';

const LOGO_SOURCES = {
  dark: require('@/assets/icons/legato_logo_horizontal_dark_version.png'),
  light: require('@/assets/icons/legato_logo_horizontal_light_version.png'),
  vertical: LegatoIconVertical,
  verticalForgotPassword: LegatoIconVertical
};

const LOGO_ASPECT_RATIO = {  
  dark: 208 / 63,
  light: 208 / 63,
  vertical: 1.5/1,
  verticalForgotPassword: 1,
};

export function AuthHeader({ subtitle, logoVariant = 'dark' }: AuthHeaderProps) {
  const aspectRatio = LOGO_ASPECT_RATIO[logoVariant];

  return (
    <View style={styles.container}>
      <Icon
        variant="image"
        source={LOGO_SOURCES[logoVariant]}
        width={Spacing.logoXl}
        aspectRatio={aspectRatio}
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
});
