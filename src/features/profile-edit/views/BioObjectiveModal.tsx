/**
 * BioObjectiveModal — View parcial (profile-edit)
 *
 * Modal de edição de Bio e Objetivo do músico.
 * Usa ModalTemplate (bottom sheet) para consistência visual com demais modais.
 *
 * Recebe control e errors do ViewModel (react-hook-form) — sem estado local.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { ModalTemplate } from '@/components/templates/ModalTemplate/ModalTemplate';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
import type { ProfileEditFormData } from '../viewmodels/useProfileEditViewModel';

interface BioObjectiveModalProps {
  visible: boolean;
  onClose: () => void;
  control: Control<ProfileEditFormData>;
  errors: FieldErrors<ProfileEditFormData>;
}

export function BioObjectiveModal({ visible, onClose, control, errors }: BioObjectiveModalProps) {
  return (
    <ModalTemplate visible={visible} onClose={onClose}>
      <LegatoText variant="sectionTitle" color={Colors.white} style={styles.title}>
        Bio &amp; Objetivo
      </LegatoText>

      {/* Bio */}
      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, value } }) => (
          <FormField
            variant="dark"
            label="Bio"
            placeholder="Fale sobre sua trajetória musical..."
            value={value ?? ''}
            onChangeText={onChange}
            errorMessage={errors.bio?.message}
            multiline
            numberOfLines={4}
          />
        )}
      />

      {/* Objetivo */}
      <View style={styles.objectiveHeader}>
        <Ionicons name="flag-outline" size={Spacing.iconSm} color={Colors.success} />
        <LegatoText variant="label" color={Colors.textSecondaryDark}>
          Objetivo
        </LegatoText>
      </View>
      <Controller
        control={control}
        name="objective"
        render={({ field: { onChange, value } }) => (
          <FormField
            variant="dark"
            label=""
            placeholder="Qual é o seu objetivo musical?"
            value={value ?? ''}
            onChangeText={onChange}
            errorMessage={errors.objective?.message}
            multiline
            numberOfLines={3}
            containerStyle={styles.objectiveField}
          />
        )}
      />

      <Button
        label="Salvar"
        variant="primary"
        size="md"
        fullWidth
        onPress={onClose}
        style={styles.saveBtn}
      />
    </ModalTemplate>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.md,
  },
  objectiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  objectiveField: {
    marginBottom: Spacing.md,
  },
  saveBtn: {
    marginTop: Spacing.xs,
  },
});
