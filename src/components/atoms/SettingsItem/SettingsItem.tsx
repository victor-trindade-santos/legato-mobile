/**
 * SettingsItem — Atom
 *
 * Linha reutilizável de configurações.
 * Suporta três variantes de controle à direita:
 *   - 'chevron'  → seta de navegação (padrão)
 *   - 'switch'   → React Native Switch para toggles
 *   - 'none'     → sem controle (item informativo)
 *
 * USO:
 *   <SettingsItem icon="person" label="Conta" onPress={...} />
 *   <SettingsItem icon="moon" label="Tema escuro" control="switch" value={isDark} onToggle={toggle} colors={colors} />
 */

import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LegatoText } from '../Text/Text';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import type { SemanticColors } from '@/hooks/useColors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingsItemProps {
  icon: IoniconName;
  label: string;
  sublabel?: string;
  colors: SemanticColors;
  control?: 'chevron' | 'switch' | 'none';
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
  rightLabel?: string;
}

export function SettingsItem({
  icon,
  label,
  sublabel,
  colors,
  control = 'chevron',
  value,
  onToggle,
  onPress,
  destructive = false,
  rightLabel,
}: SettingsItemProps) {
  const labelColor = destructive ? Colors.error : colors.textPrimary;
  const iconColor = destructive ? Colors.error : colors.iconDefault;

  const inner = (
    <View style={styles.inner}>
      {/* Ícone à esquerda */}
      <View style={[styles.iconWrap, { backgroundColor: destructive ? Colors.errorLight : `${Colors.primary}20` }]}>
        <Ionicons name={icon} size={18} color={destructive ? Colors.error : Colors.primary} />
      </View>

      {/* Texto */}
      <View style={styles.textWrap}>
        <LegatoText style={[styles.label, { color: labelColor }]}>{label}</LegatoText>
        {sublabel ? (
          <LegatoText style={[styles.sublabel, { color: colors.textMuted }]}>{sublabel}</LegatoText>
        ) : null}
      </View>

      {/* Controle à direita */}
      {control === 'chevron' && (
        <View style={styles.right}>
          {rightLabel ? (
            <LegatoText style={[styles.rightLabel, { color: colors.textMuted }]}>{rightLabel}</LegatoText>
          ) : null}
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      )}

      {control === 'switch' && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
          thumbColor={colors.switchThumb}
          ios_backgroundColor={colors.switchTrackFalse}
        />
      )}

      {control === 'none' && rightLabel ? (
        <LegatoText style={[styles.rightLabel, { color: colors.textMuted }]}>{rightLabel}</LegatoText>
      ) : null}
    </View>
  );

  if (control === 'switch') {
    return <View style={[styles.row, { borderBottomColor: colors.border }]}>{inner}</View>;
  }

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {inner}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: Typography.FontSize.sm,
    fontWeight: '500',
  },
  sublabel: {
    fontSize: Typography.FontSize.xxs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  rightLabel: {
    fontSize: Typography.FontSize.xs,
  },
});
