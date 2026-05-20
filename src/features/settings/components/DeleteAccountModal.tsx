import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { ModalTemplate } from '@/components/templates/ModalTemplate/ModalTemplate';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { useDeleteAccountViewModel } from '../viewmodels/useDeleteAccountViewModel';

interface DeleteAccountModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onDeleteSuccess: () => void;
}

export function DeleteAccountModal({ visible, onClose, onDeleteSuccess }: DeleteAccountModalProps) {
  const colors = useColors();
  const {
    step,
    control,
    errors,
    isLoading,
    errorMessage,
    handleVerifyCredentials,
    handleConfirmDelete,
    handleBack,
    handleClose,
  } = useDeleteAccountViewModel({ onClose, onDeleteSuccess });

  return (
    <ModalTemplate visible={visible} onClose={handleClose}>
      {step === 'credentials' && (
        <View style={styles.container}>
          <LegatoText variant="subtitle" color={colors.textPrimary}>
            Excluir conta
          </LegatoText>
          <LegatoText variant="bodySmall" color={colors.textSecondary} style={styles.description}>
            Para confirmar sua identidade, informe seu e-mail e senha antes de prosseguir.
          </LegatoText>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <FormField
                label="E-mail"
                placeholder="Seu e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <FormField
                label="Senha"
                placeholder="Sua senha"
                isPassword
                value={value}
                onChangeText={onChange}
                errorMessage={errors.password?.message}
                containerStyle={styles.fieldGap}
              />
            )}
          />

          {!!errorMessage && (
            <LegatoText variant="caption" color={Colors.error} style={styles.errorMsg}>
              {errorMessage}
            </LegatoText>
          )}

          <View style={styles.buttons}>
            <Button
              label="Cancelar"
              variant="outline_gray"
              size="md"
              style={styles.halfBtn}
              onPress={handleClose}
            />
            <Button
              label="Continuar"
              variant="primary"
              size="md"
              style={styles.halfBtn}
              isLoading={isLoading}
              onPress={handleVerifyCredentials}
            />
          </View>
        </View>
      )}

      {step === 'confirm' && (
        <View style={styles.container}>
          <View style={styles.warningIconRow}>
            <Ionicons name="warning-outline" size={40} color={Colors.error} />
          </View>
          <LegatoText variant="subtitle" color={colors.textPrimary} align="center">
            Tem certeza?
          </LegatoText>
          <LegatoText variant="bodySmall" color={colors.textSecondary} style={styles.confirmDescription} align="center">
            Esta ação é irreversível. Todos os seus dados, publicações e conexões serão permanentemente excluídos.
          </LegatoText>

          {!!errorMessage && (
            <LegatoText variant="caption" color={Colors.error} style={styles.errorMsg}>
              {errorMessage}
            </LegatoText>
          )}

          <View style={styles.buttons}>
            <Button
              label="Voltar"
              variant="outline_gray"
              size="md"
              style={styles.halfBtn}
              onPress={handleBack}
            />
            <Button
              label="Confirmar exclusão"
              variant="danger"
              size="md"
              style={styles.halfBtn}
              isLoading={isLoading}
              onPress={handleConfirmDelete}
            />
          </View>
        </View>
      )}

      {step === 'success' && (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle-outline" size={56} color={Colors.primary} />
          <LegatoText variant="sectionTitle" color={colors.textPrimary} align="center">
            Conta excluída
          </LegatoText>
          <LegatoText variant="bodySmall" color={colors.textSecondary} align="center">
            Sua conta foi excluída com sucesso. Até mais!
          </LegatoText>
        </View>
      )}
    </ModalTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  description: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  fieldGap: {
    marginTop: Spacing.sm,
  },
  errorMsg: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  halfBtn: {
    flex: 1,
  },
  warningIconRow: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  confirmDescription: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
});
