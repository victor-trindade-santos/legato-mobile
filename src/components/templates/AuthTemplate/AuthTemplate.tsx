/**
 * AuthTemplate — Template
 *
 * Layout base para telas de autenticação.
 * Dark background no topo (como TELA_1) com card branco para formulários (como TELA_2).
 *
 * Props:
 *  - variant "splash": fundo escuro + logo centralizado (TELA_1)
 *  - variant "form": header roxo/degradê + card branco (TELA_2)
 */

import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/theme';

type AuthTemplateVariant = 'splash' | 'form';

interface AuthTemplateProps {
  children: React.ReactNode;
  variant?: AuthTemplateVariant;
}

export function AuthTemplate({ children, variant = 'form' }: AuthTemplateProps) {
  if (variant === 'splash') {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <View style={styles.splashContent}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.formContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Splash: fundo escuro puro
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
  },

  // Form: tela com header roxo + card branco embaixo
  formContainer: {
    flex: 1,
    backgroundColor: Colors.primaryLight, // Roxo suave no topo (como TELA_2)
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});
