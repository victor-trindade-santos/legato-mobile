/**
 * FilterModal — Feature: Discovery
 * Modal de filtros de busca de músicos.
 * Usa ModalTemplate como container (bottom sheet).
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalTemplate } from '@/components/templates/ModalTemplate/ModalTemplate';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Button } from '@/components/atoms/Button/Button';
import { Tag } from '@/components/atoms/Tag/Tag';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
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
  const [local, setLocal] = useState<DiscoveryFilters>(filters);

  const toggleSkill = (skill: string) => {
    setLocal(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleGenre = (genre: string) => {
    setLocal(prev => ({
      ...prev,
      musicGenres: prev.musicGenres.includes(genre)
        ? prev.musicGenres.filter(g => g !== genre)
        : [...prev.musicGenres, genre],
    }));
  };

  const handleReset = () => setLocal(DEFAULT_FILTERS);

  const handleApply = () => onApply(local);

  return (
    <ModalTemplate visible={visible} onClose={onClose}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <LegatoText variant="sectionTitle" color={Colors.white}>Filtrar Músicos</LegatoText>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={Spacing.iconLg} color={Colors.textSecondaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* Skills */}
        <LegatoText style={styles.label}>Skills</LegatoText>
        <View style={styles.tagRow}>
          {SKILLS.map((skill) => {
            const selected = local.skills.includes(skill);
            return (
              <TouchableOpacity key={skill} onPress={() => toggleSkill(skill)}>
                <Tag
                  label={skill}
                  variant={selected ? 'filled' : 'outline'}
                  color={selected ? Colors.primary : Colors.textSecondaryDark}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Gênero */}
        <LegatoText style={styles.label}>Gênero</LegatoText>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, local.gender === g && styles.genderBtnActive]}
              onPress={() => setLocal(prev => ({ ...prev, gender: g }))}
            >
              <LegatoText style={[styles.genderLabel, local.gender === g && styles.genderLabelActive]}>
                {g}
              </LegatoText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Faixa etária */}
        <LegatoText style={styles.label}>Idade: {local.ageMin} — {local.ageMax} anos</LegatoText>
        <View style={styles.rangeRow}>
          <View style={styles.rangeControl}>
            <LegatoText style={styles.rangeCaption}>Mín</LegatoText>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setLocal(p => ({ ...p, ageMin: Math.max(16, p.ageMin - 1) }))}
              >
                <Ionicons name="remove" size={16} color={Colors.white} />
              </TouchableOpacity>
              <LegatoText style={styles.stepValue}>{local.ageMin}</LegatoText>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setLocal(p => ({ ...p, ageMin: Math.min(p.ageMax - 1, p.ageMin + 1) }))}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.rangeControl}>
            <LegatoText style={styles.rangeCaption}>Máx</LegatoText>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setLocal(p => ({ ...p, ageMax: Math.max(p.ageMin + 1, p.ageMax - 1) }))}
              >
                <Ionicons name="remove" size={16} color={Colors.white} />
              </TouchableOpacity>
              <LegatoText style={styles.stepValue}>{local.ageMax}</LegatoText>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setLocal(p => ({ ...p, ageMax: Math.min(99, p.ageMax + 1) }))}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Gêneros musicais */}
        <LegatoText style={styles.label}>Gênero Musical</LegatoText>
        <View style={styles.tagRow}>
          {MUSIC_GENRES.map((genre) => {
            const selected = local.musicGenres.includes(genre);
            return (
              <TouchableOpacity key={genre} onPress={() => toggleGenre(genre)}>
                <Tag
                  label={genre}
                  variant={selected ? 'filled' : 'outline'}
                  color={selected ? Colors.primary : Colors.textSecondaryDark}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Distância */}
        <LegatoText style={styles.label}>Distância máxima: {local.distanceMax} km</LegatoText>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setLocal(p => ({ ...p, distanceMax: Math.max(5, p.distanceMax - 5) }))}
          >
            <Ionicons name="remove" size={16} color={Colors.white} />
          </TouchableOpacity>
          <LegatoText style={styles.stepValue}>{local.distanceMax} km</LegatoText>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setLocal(p => ({ ...p, distanceMax: Math.min(100, p.distanceMax + 5) }))}
          >
            <Ionicons name="add" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Ações */}
      <View style={styles.actions}>
        <Button
          label="Resetar"
          variant="outline"
          size="md"
          style={styles.actionBtn}
          onPress={handleReset}
        />
        <Button
          label="Aplicar Filtros"
          variant="primary"
          size="md"
          style={styles.actionBtn}
          onPress={handleApply}
        />
      </View>
    </ModalTemplate>
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
    maxHeight: 420,
  },
  label: {
    color: Colors.textSecondaryDark,
    fontSize: Typography.FontSize.xs,
    fontWeight: Typography.FontWeight.semiBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderLabel: {
    color: Colors.textSecondaryDark,
    fontSize: Typography.FontSize.xs,
    fontWeight: Typography.FontWeight.medium,
  },
  genderLabelActive: {
    color: Colors.white,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rangeControl: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rangeCaption: {
    color: Colors.textMuted,
    fontSize: Typography.FontSize.xxs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    color: Colors.white,
    fontSize: Typography.FontSize.sm,
    fontWeight: Typography.FontWeight.semiBold,
    minWidth: 48,
    textAlign: 'center',
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
