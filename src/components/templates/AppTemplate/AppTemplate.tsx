/**
 * AppTemplate — Template
 *
 * Layout base para todas as telas autenticadas (MainNavigator).
 * Responsável por: SafeAreaView, AppHeader condicional e área de conteúdo.
 *
 * Não contém lógica de negócio — apenas posiciona os slots.
 * A lógica do header fica no AppHeader (molecule).
 *
 * Props:
 *  - children       → conteúdo da tela
 *  - showHeader     → exibe o AppHeader (default: true)
 *  - noPadding      → remove padding horizontal do conteúdo (default: false)
 *                     Use true em telas full-bleed como Discovery
 *  - headerProps    → repassa props para customizar o AppHeader por tela
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/theme';
import { AppHeader } from '@/components/molecules/AppHeader/AppHeader';
import type { AppHeaderProps } from '@/components/molecules/AppHeader/AppHeader.types';

interface AppTemplateProps {
  children: React.ReactNode;
  showHeader?: boolean;
  noPadding?: boolean;
  headerProps?: AppHeaderProps;
}

export function AppTemplate({
  children,
  showHeader = true,
  noPadding = false,
  headerProps,
}: AppTemplateProps) {
  return (
    <SafeAreaView style={styles.safe}>
      {showHeader && <AppHeader {...headerProps} />}
      <View style={[styles.content, noPadding && styles.contentNoPadding]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPaddingH,
  },
  contentNoPadding: {
    paddingHorizontal: 0,
  },
});
