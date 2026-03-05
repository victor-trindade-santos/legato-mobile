/**
 * LoginScreen — View (Auth)
 * Campos: email + senha. Usa useLoginViewModel.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthTemplate } from '@/components/templates/AuthTemplate/AuthTemplate';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Divider } from '@/components/atoms/Divider/Divider';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import type { AuthStackParamList } from '@/navigation/types';

type Nav = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { form, handleLogin, isLoading, errorMessage } = useLoginViewModel();
  const { control, formState: { errors } } = form;

  return (
    <AuthTemplate variant="form">
      {/* Header roxa (fundo do template) */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="musical-note" size={20} color={Colors.white} />
          </View>
          <LegatoText variant="subtitle" color={Colors.white}> Legato</LegatoText>
        </View>
        <LegatoText variant="bodySmall" color={Colors.white} align="center">
          Entre na sua conta
        </LegatoText>
      </View>

      {/* Card branco */}
      <View style={styles.card}>
        <LegatoText variant="subtitle" color={Colors.textPrimaryLight} style={styles.cardTitle}>
          Login
        </LegatoText>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Email"
              placeholder="Digite seu e-mail"
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
              placeholder="Digite sua senha"
              isPassword
              value={value}
              onChangeText={onChange}
              errorMessage={errors.password?.message}
            />
          )}
        />

        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <LegatoText variant="caption" color={Colors.textLink} style={styles.forgotPassword}>
            Esqueceu a senha?
          </LegatoText>
        </TouchableOpacity>

        {errorMessage && (
          <LegatoText variant="caption" color={Colors.error} style={styles.errorMsg}>
            {errorMessage}
          </LegatoText>
        )}

        <Button
          label="Entrar"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          onPress={handleLogin}
          style={styles.submitBtn}
        />

        <LegatoText variant="bodySmall" color={Colors.textSecondaryLight} align="center" style={styles.switchAuth}>
          Não tem conta?{' '}
          <LegatoText
            variant="bodyMedium"
            color={Colors.primary}
            onPress={() => navigation.navigate('Signup')}
          >
            Cadastre-se
          </LegatoText>
        </LegatoText>

        <Divider marginV={Spacing.md} color={Colors.borderLight} />
        <LegatoText variant="caption" color={Colors.textMuted} align="center">OU</LegatoText>
      </View>
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surfaceLight,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  cardTitle: {
    marginBottom: Spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },
  errorMsg: {
    marginBottom: Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  switchAuth: {
    marginTop: Spacing.sm,
  },
});
