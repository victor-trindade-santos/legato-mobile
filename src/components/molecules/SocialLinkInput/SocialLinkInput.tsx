/**
 * SocialLinkInput — Molecule
 *
 * Campo de link de rede social: ícone colorido + input de URL.
 * Reutilizável em ProfileEdit e futuros formulários de links.
 *
 * Uso:
 *   <SocialLinkInput
 *     iconName="logo-instagram"
 *     iconColor="#E1306C"
 *     platform="Instagram"
 *     placeholder="instagram.com/seu-perfil"
 *     value={instagram}
 *     onChangeText={setInstagram}
 *   />
 */

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { useUIStore } from '@/store/uiStore';
import type { SocialLinkInputProps } from './SocialLinkInput.types';

const THEME = {
  light: {
    background: Colors.surfaceLight,
    border: Colors.borderLight,
    text: Colors.textPrimaryLight,
  },
  dark: {
    background: Colors.surfaceDark,
    border: Colors.border,
    text: Colors.white,
  },
};

export function SocialLinkInput({
  iconName,
  iconColor,
  placeholder,
  value,
  onChangeText,
}: SocialLinkInputProps) {
  const storeTheme = useUIStore((s) => s.theme);
  const resolvedVariant = storeTheme === 'dark' ? 'dark' : 'light';
  const theme = THEME[resolvedVariant];

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons name={iconName} size={Spacing.iconMd} color={iconColor} />
      </View>
      <TextInput
        style={[styles.input, { outline: 'none', color: theme.text } as any]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        keyboardType="url"
        underlineColorAndroid="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingRight: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: Typography.FontSize.sm,
    paddingVertical: Spacing.sm,
  },
});
