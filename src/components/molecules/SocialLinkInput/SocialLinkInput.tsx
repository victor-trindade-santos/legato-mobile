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
import { useColors } from '@/hooks/useColors';
import type { SocialLinkInputProps } from './SocialLinkInput.types';

export function SocialLinkInput({
  iconName,
  iconColor,
  placeholder,
  value,
  onChangeText,
}: SocialLinkInputProps) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons name={iconName} size={Spacing.iconMd} color={iconColor} />
      </View>
      <TextInput
        style={[styles.input, { color: colors.textPrimary }, { outline: 'none' } as any]}
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
