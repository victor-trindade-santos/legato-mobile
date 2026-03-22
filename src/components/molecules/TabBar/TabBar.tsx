/**
 * TabBar — Molecule
 *
 * Barra de abas horizontal com indicador ativo (underline primary).
 * Reutilizável em qualquer tela que precise de tabs.
 *
 * Uso:
 *   const tabs = [{ key: 'tudo', label: 'Tudo' }, { key: 'card', label: 'Card' }];
 *   <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
import type { TabBarProps } from './TabBar.types';

export function TabBar({ tabs, activeTab, onTabChange, style }: TabBarProps) {
  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <LegatoText
              variant="label"
              color={isActive ? Colors.primary : Colors.textMuted}
            >
              {tab.label}
            </LegatoText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: Colors.transparent,
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
});
