/**
 * AuthTemplate — Template
 *
 * Layout base para telas de autenticação.
 *
 * Props:
 *  - variant "splash": fundo escuro + logo centralizado (TELA_1)
 *  - variant "form": header roxo/degradê + card branco (TELA_2)
 *
 * Background:
 *  - Image com absoluteFill cobre todo o espaço físico (inclusive barra Android).
 *  - BlurView (expo-blur) sobre a imagem: sem artefato de borda e tint="dark" escurece.
 */

import React from 'react';
import { View, Image, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Spacing } from '@/theme';

const bgImage = require('@/assets/images/BACKGROUND_SPLASH.png');

type AuthTemplateVariant = 'splash' | 'form';

interface AuthTemplateProps {
  children: React.ReactNode;
  variant?: AuthTemplateVariant;
}

export function AuthTemplate({ children, variant = 'form' }: AuthTemplateProps) {
  const background = (
    <>
      <Image source={bgImage} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
    </>
  );

  if (variant === 'splash') {
    return (
      <View style={styles.root}>
        {background}
        <SafeAreaView style={styles.fill}>
          <View style={styles.splashContent}>{children}</View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {background}
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.fill}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  splashContent: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});
