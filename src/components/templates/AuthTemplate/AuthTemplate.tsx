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

import React, { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, KeyboardAvoidingView, Dimensions, LayoutChangeEvent, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Spacing } from '@/theme';

const bgImage = require('@/assets/images/BACKGROUND_SPLASH.png');

// Dimensions.get('screen') = dimensões físicas do hardware (inclui barra de navegação Android)
// Necessário para que a imagem cubra toda a tela sem bordas cinzas
const { width: PHYS_W, height: PHYS_H } = Dimensions.get('screen');

type AuthTemplateVariant = 'splash' | 'form';

interface AuthTemplateProps {
  children: React.ReactNode;
  variant?: AuthTemplateVariant;
  header?: React.ReactNode;
  /** true: header absolute, card scrolls over it. false (default): header fixed above scroll. */
  scrollOverHeader?: boolean;
}

export function AuthTemplate({ children, variant = 'form', header, scrollOverHeader = false }: AuthTemplateProps) {
  const [headerH, setHeaderH] = useState(0);

  const background = (
    <>
      <Image
        source={bgImage}
        style={styles.bgImage}
        resizeMode="cover"
      />
      {Platform.OS === 'ios' ? (
        <BlurView intensity={55} tint="dark" style={styles.bgImage} />
      ) : (
        <View style={[styles.bgImage, styles.androidOverlay]} />
      )}
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

  if (scrollOverHeader) {
    return (
      <View style={styles.root}>
        {background}
        <SafeAreaView style={styles.fill}>
          {header && (
            <View
              style={styles.headerAbsolute}
              onLayout={(e: LayoutChangeEvent) => setHeaderH(e.nativeEvent.layout.height)}
            >
              {header}
            </View>
          )}
          <KeyboardAvoidingView behavior="padding" style={styles.fill}>
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingTop: headerH }]}
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

  return (
    <View style={styles.root}>
      {background}
      <SafeAreaView style={styles.fill}>
                  {header && (
            <View
              style={styles.headerFixed}
              onLayout={(e: LayoutChangeEvent) => setHeaderH(e.nativeEvent.layout.height)}
            >
              {header}
            </View>
          )}
        <KeyboardAvoidingView behavior="padding" style={styles.fill}>
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.scrollContentBottom}
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
  bgImage: {
    position: 'absolute',
    width: PHYS_W,
    height: PHYS_H,
    top: 0,
    left: 0,
  },
  fill: {
    flex: 1,
  },
  headerFixed: {
    marginTop: Spacing.xxxxl,
    marginBottom: Spacing.none,
  },
  headerAbsolute: {
    position: 'absolute',
    top: Spacing.xl,
    left: 0,
    right: 0,
  },
  splashContent: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContentBottom: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  androidOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
});
