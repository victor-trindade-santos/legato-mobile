/**
 * SignupScreen — View (Auth)
 * Campos: username, displayName, email, senha, confirmar senha, aceitar termos.
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
import { DateInput } from '@/components/molecules/DateInput/DateInput';
import { Button } from '@/components/atoms/Button/Button';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Divider } from '@/components/atoms/Divider/Divider';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useSignupViewModel } from '../viewmodels/useSignupViewModel';
import type { AuthStackParamList } from '@/navigation/types';

type Nav = StackNavigationProp<AuthStackParamList, 'Signup'>;

const fieldStyle = { marginBottom: Spacing.sm };

export default function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const { form, handleSignup, isLoading, errorMessage } = useSignupViewModel();
  const { control, formState: { errors }, watch, setValue } = form;
  const acceptTerms = watch('acceptTerms');

  return (
    <AuthTemplate variant="form" 
    header={<AuthHeader subtitle="Crie sua conta para começar" />}>
      {/* Card */}
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={Spacing.iconXl} color={Colors.primary} />
          </TouchableOpacity>
          <LegatoText variant="subtitle" color={Colors.textPrimaryLight}>Cadastro</LegatoText>
        </View>

        <Controller control={control} name="username" render={({ field: { onChange, value } }) => (
          <FormField label="Username" placeholder="Seu @username único" autoCapitalize="none"
            variant="light" containerStyle={fieldStyle} value={value} onChangeText={onChange} errorMessage={errors.username?.message} />
        )} />

        <Controller control={control} name="displayName" render={({ field: { onChange, value } }) => (
          <FormField label="Display Name" placeholder="Como você quer aparecer?"
            variant="light" containerStyle={fieldStyle} value={value} onChangeText={onChange} errorMessage={errors.displayName?.message} />
        )} />

        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <FormField label="Email" placeholder="Digite seu e-mail" keyboardType="email-address"
            autoCapitalize="none" variant="light" containerStyle={fieldStyle} value={value} onChangeText={onChange} errorMessage={errors.email?.message} />
        )} />

        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <FormField label="Senha" placeholder="Digite sua senha" isPassword
            variant="light" containerStyle={fieldStyle} value={value} onChangeText={onChange} errorMessage={errors.password?.message} />
        )} />

        <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
          <FormField label="Confirmar Senha" placeholder="Confirme sua senha" isPassword
            variant="light" containerStyle={fieldStyle} value={value} onChangeText={onChange} errorMessage={errors.confirmPassword?.message} />
        )} />

        {/* Termos */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setValue('acceptTerms', acceptTerms ? undefined as any : true)}
        >
          <View style={[styles.checkbox, acceptTerms ? styles.checkboxChecked : null]}>
            {acceptTerms && <Ionicons name="checkmark" size={14} color={Colors.white} />}
          </View>
          <LegatoText variant="caption" color={Colors.textSecondaryLight} style={styles.termsText}>
            Aceito os{' '}
            <LegatoText variant="caption" color={Colors.primary}>termos de uso</LegatoText>
            {' '}e{' '}
            <LegatoText variant="caption" color={Colors.primary}>política de privacidade</LegatoText>
          </LegatoText>
        </TouchableOpacity>
        {errors.acceptTerms && (
          <LegatoText variant="caption" color={Colors.error}>{errors.acceptTerms.message}</LegatoText>
        )}

        {/* Data de nascimento */}
        <Controller control={control} name="birthDate" render={({ field: { onChange, value } }) => (
          <DateInput
            label="Data de Nascimento"
            value={value}
            onChange={onChange}
            errorMessage={errors.birthDate?.message}
            containerStyle={fieldStyle}
          />
        )} />

        {errorMessage && (
          <LegatoText variant="caption" color={Colors.error} style={styles.errorMsg}>{errorMessage}</LegatoText>
        )}

        <Button label="Inscrever-se" variant="primary" size="md" fullWidth
          isLoading={isLoading} onPress={handleSignup} style={styles.submitBtn} />

        <LegatoText variant="bodySmall" color={Colors.textSecondaryLight} align="center">
          Já tem conta?{' '}
          <LegatoText variant="bodyMedium" color={Colors.primary} onPress={() => navigation.navigate('Login')}>
            Fazer login
          </LegatoText>
        </LegatoText>

        <Divider marginV={Spacing.md} color={Colors.borderLight} />
        <LegatoText variant="caption" color={Colors.textMuted} align="center">OU</LegatoText>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  termsRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: Spacing.md, 
    marginBottom: Spacing.sm ,
    marginTop: Spacing.sm,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: BorderRadius.xs,
    borderWidth: 2, borderColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  termsText: { flex: 1 },
  errorMsg: { marginBottom: Spacing.xs },
  submitBtn: { marginTop: Spacing.sm, marginBottom: Spacing.md },
});
