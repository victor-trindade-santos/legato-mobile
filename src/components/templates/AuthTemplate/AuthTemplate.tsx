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
 *  - Svg com feGaussianBlur renderiza o blur universalmente (iOS, Android, Expo Go, web).
 *  - View escura por cima para o efeito de escurecimento (equivalente ao tint="dark").
 */

import React, { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Filter, FeGaussianBlur, Image as SvgImage } from 'react-native-svg';
import { Spacing } from '@/theme';

const bgImage = require('@/assets/images/BACKGROUND_SPLASH.png');

const { width: PHYS_W, height: PHYS_H } = Dimensions.get('screen');

// Margem extra para que as bordas da imagem não fiquem com artefato de blur cortado
const BLEED = 30;

const bgUri = Image.resolveAssetSource?.(bgImage)?.uri ?? (bgImage as unknown as string);

type AuthTemplateVariant = 'splash' | 'form';

interface AuthTemplateProps {
  children: React.ReactNode;
  variant?: AuthTemplateVariant;
  header?: React.ReactNode;
  /** true: header absolute, card scrolls over it. false (default): header fixed above scroll. */
  scrollOverHeader?: boolean;
  /** true: header inside scroll container, centered in the space above the card. */
  headerCentered?: boolean;
}

export function AuthTemplate({ children, variant = 'form', header, scrollOverHeader = false, headerCentered = false }: AuthTemplateProps) {
  const [headerH, setHeaderH] = useState(0);

  const background = (
    <>
      <Svg width={PHYS_W} height={PHYS_H} style={styles.bgImage}>
        <Defs>
          <Filter id="blur" x="-5%" y="-5%" width="110%" height="110%">
            <FeGaussianBlur stdDeviation="8" />
          </Filter>
        </Defs>
        <SvgImage
          href={bgUri}
          x={-BLEED}
          y={-BLEED}
          width={PHYS_W + BLEED * 2}
          height={PHYS_H + BLEED * 2}
          preserveAspectRatio="xMidYMid slice"
          filter="url(#blur)"
        />
      </Svg>
      <View style={[styles.bgImage, styles.darkOverlay]} />
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

  if (headerCentered) {
    return (
      <View style={styles.root}>
        {background}
        <SafeAreaView style={styles.fill}>
          {/*
           * enabled={iOS only}: no Android o sistema já redimensiona a janela nativamente
           * (softwareKeyboardLayoutMode="resize" é o padrão no Expo SDK 52+), então o KAV
           * ficaria em conflito (double-handle). No iOS o KAV calcula o overlap correto
           * em coordenadas de tela quando está dentro do SafeAreaView.
           */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.fill}
          >
            <View style={styles.fill}>
              {header && <View style={styles.headerCenteredArea}>{header}</View>}
              {children}
            </View>
          </KeyboardAvoidingView>
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.fill}
          >
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.fill}
        >
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
    justifyContent: 'flex-end',
  },
  headerCenteredArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContentBottom: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  darkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
});
