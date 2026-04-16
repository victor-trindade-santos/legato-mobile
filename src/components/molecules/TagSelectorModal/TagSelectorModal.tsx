/**
 * TagSelectorModal — Molecule
 *
 * Modal de seleção múltipla de tags (skills, gêneros musicais, etc.).
 * Reutilizável em ProfileEdit, Discovery e qualquer filtro de tags.
 *
 * Uso:
 *   <TagSelectorModal
 *     visible={showSkills}
 *     title="Habilidades"
 *     items={SKILLS}
 *     selected={selectedSkills}
 *     onConfirm={(items) => setSelectedSkills(items)}
 *     onClose={() => setShowSkills(false)}
 *   />
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalTemplate } from '@/components/templates/ModalTemplate/ModalTemplate';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Button } from '@/components/atoms/Button/Button';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { useColors } from '@/hooks/useColors';
import type { TagSelectorModalProps } from './TagSelectorModal.types';

export function TagSelectorModal({
  visible,
  title,
  items,
  selected,
  onConfirm,
  onClose,
  getItemLabel,
}: TagSelectorModalProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selected);
  const [search, setSearch] = useState('');

  // Sincroniza ao abrir
  useEffect(() => {
    if (visible) {
      setLocalSelected(selected);
      setSearch('');
    }
  }, [visible]);

  const filtered = search.trim()
    ? items.filter((item) => {
      const label = getItemLabel ? getItemLabel(item) : item;
      const query = search.toLowerCase();
      return label.toLowerCase().includes(query) || item.toLowerCase().includes(query);
    })
    : items;

  const getLabel = (item: string) => getItemLabel?.(item) ?? item;

  const toggle = (item: string) => {
    setLocalSelected((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelected);
    onClose();
  };

  const colors = useColors();

  return (
    <ModalTemplate visible={visible} onClose={onClose}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <LegatoText variant="sectionTitle" color={colors.textPrimary}>{title}</LegatoText>
        <TouchableOpacity onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={Spacing.iconLg} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={[styles.searchRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={Spacing.iconSm} color={Colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary, outline: 'none' } as any]}
          placeholder="Buscar..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          underlineColorAndroid="transparent"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={Spacing.iconSm} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Grid de tags */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.grid}>
          {filtered.map((item) => {
            const isSelected = localSelected.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => toggle(item)}
                style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }, isSelected && styles.chipSelected]}
              >
                <LegatoText
                  variant="caption"
                  color={isSelected ? Colors.white : colors.textSecondary}
                >
                  {getLabel(item)}
                </LegatoText>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Rodapé */}
      <View style={styles.footer}>
        <LegatoText variant="caption" color={Colors.textMuted}>
          {localSelected.length} selecionado{localSelected.length !== 1 ? 's' : ''}
        </LegatoText>
        <Button
          label="Confirmar"
          variant="primary"
          size="sm"
          onPress={handleConfirm}
          style={styles.confirmBtn}
        />
      </View>
    </ModalTemplate>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.FontSize.sm,
    paddingVertical: 0,
  },
  scroll: {
    maxHeight: 300,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  confirmBtn: {
    minWidth: 120,
  },
});
