/**
 * SplashScreen — View (Auth)
 *
 * Tela inicial do app conforme TELA_1_INICIAL.png:
 * - Fundo escuro (#0E0F12)
 * - Ícone roxo circular com nota musical
 * - Título "Legato" em branco
 * - Subtítulo e descrição centralizados
 * - Botão "Cadastre-se" (primary, roxo sólido)
 * - Botão "Fazer Login" (outline, borda branca)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthTemplate } from '@/components/templates/AuthTemplate/AuthTemplate';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Button } from '@/components/atoms/Button/Button';
import { Colors, Spacing, BorderRadius } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Nav = StackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <AuthTemplate variant="splash">
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Ionicons name="musical-note" size={40} color={Colors.white} />
        </View>
        <LegatoText variant="title" color={Colors.white} align="center" style={styles.logoText}>
          Legato
        </LegatoText>
      </View>

      {/* Tagline */}
      <View style={styles.tagline}>
        <LegatoText variant="subtitle" color={Colors.white} align="center" style={styles.headline}>
          Conecte-se com músicos em todos os lugares
        </LegatoText>
        <LegatoText variant="bodySmall" color={Colors.textSecondaryDark} align="center">
          Descubra talentos, colabore em projetos e faça sua música ressoar no mundo.
        </LegatoText>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label="Cadastre-se"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => navigation.navigate('Signup')}
        />
        <View style={styles.gap} />
        <Button
          label="Fazer Login"
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => navigation.navigate('Login')}
        />
      </View>

      <LegatoText variant="caption" color={Colors.textMuted} align="center" style={styles.version}>
        VERSÃO 1.0.0
      </LegatoText>
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoIcon: {
    width: 70,
    height: 80,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    letterSpacing: 1,
  },
  tagline: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  headline: {
    marginBottom: Spacing.xs,
  },
  actions: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  gap: {
    height: Spacing.md,
  },
  version: {
    marginTop: Spacing.lg,
  },
});
