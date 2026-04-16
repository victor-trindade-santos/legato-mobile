/**
 * SelectField — Molecule
 *
 * Campo de seleção única com menu suspenso (Modal).
 * Visual idêntico ao FormField: label + caixa + mensagem de erro.
 * Reutilizável para qualquer campo de escolha discreta (sexo, estado, país…).
 *
 * USO:
 *   <SelectField
 *     label="Gênero"
 *     options={SEX_OPTIONS}
 *     value={value}
 *     onChange={onChange}
 *     placeholder="Selecione..."
 *     variant="dark"
 *   />
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { useUIStore } from '@/store/uiStore';
import { useColors } from '@/hooks/useColors';
import type { SelectFieldProps, SelectOption } from './SelectField.types';

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

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  errorMessage,
  variant,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const storeTheme = useUIStore((s) => s.theme);
  const resolvedVariant = variant ?? (storeTheme === 'dark' ? 'dark' : 'light');
  const theme = THEME[resolvedVariant];
  const colors = useColors();

  const selected = options.find((o) => o.value === value);

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <LegatoText variant="label" color={colors.textSecondary} style={styles.label}>
        {label}
      </LegatoText>

      <TouchableOpacity
        style={[
          styles.field,
          { backgroundColor: theme.background, borderColor: theme.border },
          open && styles.fieldOpen,
          !!errorMessage && styles.fieldError,
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <LegatoText
          variant="bodySmall"
          color={selected ? theme.text : Colors.textMuted}
          style={styles.fieldText}
        >
          {selected ? selected.label : placeholder}
        </LegatoText>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={Spacing.iconSm}
          color={Colors.textMuted}
        />
      </TouchableOpacity>

      {errorMessage && (
        <LegatoText variant="caption" color={Colors.error} style={styles.error}>
          {errorMessage}
        </LegatoText>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <LegatoText variant="sectionTitle" color={Colors.white}>
                {label}
              </LegatoText>
              <TouchableOpacity onPress={() => setOpen(false)} style={[styles.closeBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="close" size={Spacing.iconMd} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isActive = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isActive && styles.optionActive]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.75}
                  >
                    <LegatoText
                      variant="bodySmall"
                      color={isActive ? Colors.primary : Colors.white}
                    >
                      {item.label}
                    </LegatoText>
                    {isActive && (
                      <Ionicons name="checkmark" size={Spacing.iconMd} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    letterSpacing: 0.8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.inputPaddingH,
    height: Spacing.buttonHeightMd,
  },
  fieldOpen: {
    borderColor: Colors.primary,
  },
  fieldError: {
    borderColor: Colors.error,
  },
  fieldText: {
    flex: 1,
    fontSize: Typography.FontSize.sm,
  },
  error: {
    marginTop: 4,
  },
  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
  },
  sheet: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    maxHeight: '60%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  closeBtn: {
    width: Spacing.buttonHeightSm,
    height: Spacing.buttonHeightSm,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
  },
  optionActive: {
    backgroundColor: Colors.primaryMuted,
  },
});
