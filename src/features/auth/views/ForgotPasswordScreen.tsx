/**
 * ForgotPasswordScreen — View (Auth)
 * Solicita o e-mail para enviar o link de redefinição.
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
import { useForgotPasswordViewModel } from '../viewmodels/useForgotPasswordViewModel';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { form, handleSend, isLoading, successMessage, errorMessage } = useForgotPasswordViewModel();
  const { control, formState: { errors } } = form;

  return (
    <AuthTemplate variant="form" header={<AuthHeader subtitle="Recuperar senha" logoVariant="verticalForgotPassword" />}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={Spacing.iconXl} color={Colors.primary} />
          </TouchableOpacity>
          <LegatoText variant="subtitle" color={Colors.textPrimaryLight}>Esqueceu a senha?</LegatoText>
        </View>

        {successMessage ? (
          <View style={styles.successContainer}>
            <Ionicons name="mail-outline" size={64} color={Colors.primary} />
            <LegatoText variant="sectionTitle" color={Colors.textPrimaryLight} align="center" style={styles.successTitle}>
              E-mail enviado!
            </LegatoText>
            <LegatoText variant="bodySmall" color={Colors.textSecondaryLight} align="center">
              Verifique sua caixa de entrada e clique no link para criar uma nova senha.
            </LegatoText>
            <Button
              label="Ir para Login"
              variant="primary"
              size="md"
              fullWidth
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginBtn}
            />
          </View>
        ) : (
          <>
            <LegatoText variant="bodySmall" color={Colors.textSecondaryLight} style={styles.hint}>
              Vamos enviar um link seguro para redefinir a sua senha.
            </LegatoText>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <FormField
                  label="E-mail"
                  placeholder="Digite seu e-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  variant="light"
                  value={value}
                  onChangeText={onChange}
                  errorMessage={errors.email?.message}
                />
              )}
            />

            {errorMessage && (
              <LegatoText variant="caption" color={Colors.error} style={styles.errorMsg}>
                {errorMessage}
              </LegatoText>
            )}

            <Button
              label="Enviar link"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
              onPress={handleSend}
              style={styles.btn}
            />
          </>
        )}
      </View>
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLight,
    borderTopLeftRadius: BorderRadius.xxxl,
    borderTopRightRadius: BorderRadius.xxxl,
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
  loginBtn: { marginTop: Spacing.lg },
  errorMsg: { marginBottom: Spacing.sm },
  btn: { marginTop: Spacing.sm },
});