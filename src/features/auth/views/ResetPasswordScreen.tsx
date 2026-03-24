/**
 * ResetPasswordScreen — View (Auth)
 * Recuperação de senha por e-mail.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthTemplate } from '@/components/templates/AuthTemplate/AuthTemplate';
import { AuthHeader } from '@/components/molecules/AuthHeader/AuthHeader';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useResetPasswordViewModel } from '../viewmodels/useResetPasswordViewModel';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const { form, handleReset, isLoading, sent, errorMessage } = useResetPasswordViewModel();
  const { control, formState: { errors } } = form;

  return (
    <AuthTemplate variant="form" 
    header={<AuthHeader subtitle="Recuperar senha" />}>

      <View style={styles.card}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={Spacing.iconXl} color={Colors.primary} />
          </TouchableOpacity>
          <LegatoText variant="subtitle" color={Colors.textPrimaryLight}>Recuperar Senha</LegatoText>
        </View>

        {sent ? (
          <View style={styles.successContainer}>
            <Ionicons name="mail-outline" size={64} color={Colors.primary} />
            <LegatoText variant="sectionTitle" color={Colors.textPrimaryLight} align="center" style={styles.successTitle}>
              E-mail enviado!
            </LegatoText>
            <LegatoText variant="bodySmall" color={Colors.textSecondaryLight} align="center">
              Verifique sua caixa de entrada e siga as instruções.
            </LegatoText>
          </View>
        ) : (
          <>
            <LegatoText variant="bodySmall" color={Colors.textSecondaryLight} style={styles.hint}>
              Enviaremos um link para redefinir sua senha.
            </LegatoText>
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
              <FormField label="E-mail" placeholder="Digite seu e-mail" keyboardType="email-address"
                autoCapitalize="none" value={value} onChangeText={onChange} errorMessage={errors.email?.message} />
            )} />
            {errorMessage && (
              <LegatoText variant="caption" color={Colors.error} style={styles.errorMsg}>{errorMessage}</LegatoText>
            )}
            <Button label="Enviar link" variant="primary" size="md" fullWidth
              isLoading={isLoading} onPress={handleReset} style={styles.btn} />
          </>
        )}
      </View>
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.xxl,
    marginHorizontal: Spacing.screenPaddingH,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  hint: {
    marginBottom: Spacing.lg,
  },
  successContainer: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  successTitle: { marginTop: Spacing.md },
  errorMsg: { marginBottom: Spacing.sm },
  btn: { marginTop: Spacing.sm },
});
