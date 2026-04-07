/**
 * SettingsScreen — View (Configurações)
 *
 * Tela de configurações do usuário autenticado.
 * Acessível via ícone de engrenagem no AppHeader.
 */

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, Typography } from '@/theme';
import { useSettingsViewModel } from '../viewmodels/useSettingsViewModel';

export default function SettingsScreen() {
  const { handleBack } = useSettingsViewModel();

  return (
    <AppTemplate showHeader={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={Spacing.iconLg} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Image
            source={require('@/assets/icons/legato_logo_horizontal_dark_version.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <LegatoText style={styles.separator}>|</LegatoText>
          <LegatoText style={styles.title}>Configurações</LegatoText>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Conteúdo — a ser implementado */}
      <View style={styles.empty} />
    </AppTemplate>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  logo: {
    height: 28,
    width: 80,
  },
  separator: {
    color: Colors.textSecondaryDark,
    fontSize: Typography.FontSize.md,
  },
  title: {
    color: Colors.white,
    fontSize: Typography.FontSize.md,
    fontWeight: '500',
  },
  empty: {
    flex: 1,
  },
});
