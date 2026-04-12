/**
 * FilterModal — Feature: Discovery
 * Modal de filtros de busca de músicos.
 * Usa ModalTemplate como container (bottom sheet).
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalTemplate } from '@/components/templates/ModalTemplate/ModalTemplate';
import { TagSelectorModal } from '@/components/molecules/TagSelectorModal/TagSelectorModal';
import { TagSection } from '@/components/molecules/TagSection/TagSection';
import { RangeSlider } from '@/components/molecules/RangeSlider/RangeSlider';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Button } from '@/components/atoms/Button/Button';
import { Colors, Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { SKILLS } from '@/constants/skills';
import { MUSIC_GENRES } from '@/constants/genres';
import type { DiscoveryFilters } from '../models/DiscoveryFilters';
import { DEFAULT_FILTERS } from '../models/DiscoveryFilters';

interface FilterModalProps {
  visible: boolean;
  filters: DiscoveryFilters;
  onApply: (filters: DiscoveryFilters) => void;
  onClose: () => void;
}

const GENDERS = ['Todos', 'Masculino', 'Feminino', 'Outro'] as const;

export function FilterModal({ visible, filters, onApply, onClose }: FilterModalProps) {
  const colors = useColors();
  const [local, setLocal] = useState<DiscoveryFilters>(filters);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showGenresModal, setShowGenresModal] = useState(false);

  const removeSkill = (skill: string) =>
    setLocal(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

  const removeGenre = (genre: string) =>
    setLocal(prev => ({ ...prev, musicGenres: prev.musicGenres.filter(g => g !== genre) }));

  const confirmSkills = (items: string[]) =>
    setLocal(prev => ({ ...prev, skills: items }));

  const confirmGenres = (items: string[]) =>
    setLocal(prev => ({ ...prev, musicGenres: items }));

  const handleReset = () => setLocal(DEFAULT_FILTERS);
  const handleApply = () => onApply(local);

  return (
    <>
      <ModalTemplate visible={visible} onClose={onClose}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <LegatoText variant="sectionTitle" color={colors.textPrimary}>Filtrar Músicos</LegatoText>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={Spacing.iconLg} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

          {/* Skills */}
          <TagSection
            label="Habilidades"
            selected={local.skills}
            onRemove={removeSkill}
            onAdd={() => setShowSkillsModal(true)}
            tagVariant="filled"
            tagColor={Colors.primary}
            emptyMessage="Nenhuma habilidade selecionada"
          />

          {/* Gêneros musicais */}
          <TagSection
            label="Gêneros Musicais"
            selected={local.musicGenres}
            onRemove={removeGenre}
            onAdd={() => setShowGenresModal(true)}
            tagVariant="outline"
            tagColor={Colors.primaryLight}
            emptyMessage="Nenhum gênero selecionado"
          />

          {/* Gênero */}
          <LegatoText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Gênero</LegatoText>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <Button
                key={g}
                label={g}
                variant={local.gender === g ? 'primary' : 'secondary'}
                size="sm"
                style={styles.genderBtn}
                onPress={() => setLocal(prev => ({ ...prev, gender: g }))}
              />
            ))}
          </View>

          {/* Faixa etária */}
          <RangeSlider
            label="Idade"
            unit="anos"
            min={16}
            max={99}
            minValue={local.ageMin}
            maxValue={local.ageMax}
            onMinChange={v => setLocal(p => ({ ...p, ageMin: v }))}
            onMaxChange={v => setLocal(p => ({ ...p, ageMax: v }))}
          />

          {/* Distância */}
          <RangeSlider
            label="Distância"
            unit="km"
            min={0}
            max={100}
            step={5}
            minValue={local.distanceMin}
            maxValue={local.distanceMax}
            onMinChange={v => setLocal(p => ({ ...p, distanceMin: v }))}
            onMaxChange={v => setLocal(p => ({ ...p, distanceMax: v }))}
          />

          <View style={styles.spacer} />
        </ScrollView>

        {/* Ações */}
        <View style={styles.actions}>
          <Button label="Resetar" variant="outline" size="md" style={styles.actionBtn} onPress={handleReset} />
          <Button label="Aplicar Filtros" variant="primary" size="md" style={styles.actionBtn} onPress={handleApply} />
        </View>
      </ModalTemplate>

      <TagSelectorModal
        visible={showSkillsModal} title="Habilidades"
        items={SKILLS} selected={local.skills}
        onConfirm={confirmSkills} onClose={() => setShowSkillsModal(false)}
      />
      <TagSelectorModal
        visible={showGenresModal} title="Gêneros Musicais"
        items={MUSIC_GENRES} selected={local.musicGenres}
        onConfirm={confirmGenres} onClose={() => setShowGenresModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scroll: {
    maxHeight: 440,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  genderBtn: {
    flex: 1,
  },
  spacer: {
    height: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
