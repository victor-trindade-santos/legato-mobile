/**
 * SettingsScreen — View (Configurações)
 *
 * Tela de configurações do usuário autenticado.
 * Acessível via ícone de engrenagem no AppHeader.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, Typography } from '@/theme';
import { useSettingsViewModel } from '../viewmodels/useSettingsViewModel';

export default function SettingsScreen() {
  const { handleBack } = useSettingsViewModel();

  return (
    <AppTemplate showHeader={false}>
      {/* Header manual com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={Spacing.iconLg} color={Colors.white} />
        </TouchableOpacity>
        <LegatoText style={styles.title}>Configurações</LegatoText>
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
  title: {
    color: Colors.white,
    fontSize: Typography.FontSize.lg,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
  },
});
