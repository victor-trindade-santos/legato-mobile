/**
 * TagSection — Molecule
 *
 * Header (label + botão "+ Add") + lista de tags selecionadas ou mensagem vazia.
 * Pressionar uma tag chama onRemove; pressionar "+ Add" chama onAdd.
 *
 * Reutilizável em:
 *  - ProfileEditScreen  (skills, gêneros)
 *  - FilterModal        (skills, gêneros)
 *  - qualquer tela que exiba um conjunto de tags editável
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tag } from '@/components/atoms/Tag/Tag';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';
import type { TagSectionProps } from './TagSection.types';

export function TagSection({
  label,
  selected,
  onRemove,
  onAdd,
  tagVariant = 'filled',
  tagColor = Colors.primary,
  emptyMessage = 'Nenhum item selecionado',
  getItemLabel,
}: TagSectionProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LegatoText variant="bodySmall" color={colors.textPrimary}>{label}</LegatoText>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Ionicons name="add" size={16} color={Colors.primary} />
          <LegatoText variant="caption" color={Colors.primary}>Add</LegatoText>
        </TouchableOpacity>
      </View>

      {selected.length > 0 ? (
        <View style={styles.tagRow}>
          {selected.map((item) => (
            <TouchableOpacity key={item} onPress={() => onRemove(item)}>
              <Tag label={getItemLabel ? getItemLabel(item) : item} variant={tagVariant} color={tagColor} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <LegatoText variant="caption" color={Colors.textMuted}>
          {emptyMessage}
        </LegatoText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
