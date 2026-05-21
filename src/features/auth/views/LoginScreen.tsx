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
import { AuthHeader } from '@/components/molecules/AuthHeader/AuthHeader';
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
    <AuthTemplate variant="form" headerCentered header={<AuthHeader subtitle="Sua música em qualquer lugar" logoVariant="vertical" />}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={Spacing.iconXl} color={Colors.primary} />
          </TouchableOpacity>
          <LegatoText variant="subtitle" color={Colors.textPrimaryLight}>Login</LegatoText>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Email"
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Senha"
              placeholder="Digite sua senha"
              isPassword
              variant="light"
              value={value}
              onChangeText={onChange}
              errorMessage={errors.password?.message}
            />
          )}
        />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
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
          size="md"
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

        {/* <Divider marginV={Spacing.md} color={Colors.borderLight} />
        <LegatoText variant="caption" color={Colors.textMuted} align="center">OU</LegatoText> */}
      </View>
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLight,
    borderTopRightRadius: BorderRadius.xxxl,
    borderTopLeftRadius: BorderRadius.xxxl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
