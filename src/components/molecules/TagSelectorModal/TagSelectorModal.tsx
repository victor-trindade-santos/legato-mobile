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
import type { TagSelectorModalProps } from './TagSelectorModal.types';

export function TagSelectorModal({
  visible,
  title,
  items,
  selected,
  onConfirm,
  onClose,
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
    ? items.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
    : items;

  const toggle = (item: string) => {
    setLocalSelected((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelected);
    onClose();
  };

  return (
    <ModalTemplate visible={visible} onClose={onClose}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <LegatoText variant="sectionTitle" color={Colors.white}>{title}</LegatoText>
        <TouchableOpacity onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={Spacing.iconLg} color={Colors.textSecondaryDark} />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={Spacing.iconSm} color={Colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { outline: 'none' } as any]}
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
                style={[styles.chip, isSelected && styles.chipSelected]}
              >
                <LegatoText
                  variant="caption"
                  color={isSelected ? Colors.white : Colors.textSecondaryDark}
                >
                  {item}
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
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDark,
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
