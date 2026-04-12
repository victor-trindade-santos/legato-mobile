/**
 * SettingsScreen — View (Configurações)
 *
 * Tela de configurações do usuário autenticado.
 * Acessível via ícone de engrenagem no AppHeader.
 *
 * Seções:
 *  1. Perfil — avatar, nome, editar perfil
 *  2. Aparência — toggle dark/light
 *  3. Conta — email, alterar senha (placeholder)
 *  4. Sobre — versão do app
 *  5. Sair — logout
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { SettingsItem } from '@/components/atoms/SettingsItem/SettingsItem';
import { Spacing, Typography, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { useSettingsViewModel } from '../viewmodels/useSettingsViewModel';

export default function SettingsScreen() {
  const {
    user,
    isDarkTheme,
    toggleTheme,
    handleBack,
    handleEditProfile,
    handleLogout,
    isLoggingOut,
    appVersion,
  } = useSettingsViewModel();

  const colors = useColors();

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja sair da conta?')) handleLogout();
      return;
    }
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: handleLogout },
      ],
    );
  };

  if (isLoggingOut) return <Spinner fullScreen />;

  return (
    <AppTemplate showHeader={false}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={Spacing.iconLg} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <Image
            source={isDarkTheme
              ? require('@/assets/icons/legato_logo_horizontal_dark_version.png')
              : require('@/assets/icons/legato_logo_horizontal_light_version.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <LegatoText style={[styles.headerSeparator, { color: colors.textSecondary }]}>|</LegatoText>
          <LegatoText style={[styles.headerTitle, { color: colors.textPrimary }]}>Configurações</LegatoText>
        </View>

        {/* Espaçador para centralizar o logo */}
        <View style={styles.backBtn} />
      </View>

      {/* ── Conteúdo ────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cartão de perfil ──────────────────────────── */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleEditProfile}
          activeOpacity={0.8}
        >
          <Avatar
            uri={user?.avatarUrl}
            fallbackInitials={user?.displayName ?? user?.username ?? '?'}
            size="lg"
          />
          <View style={styles.profileInfo}>
            <LegatoText style={[styles.profileName, { color: colors.textPrimary }]}>
              {user?.displayName ?? user?.username ?? 'Usuário'}
            </LegatoText>
            <LegatoText style={[styles.profileUsername, { color: colors.textSecondary }]}>
              Editar informações de perfil
            </LegatoText>
            <LegatoText style={[styles.profileEmail, { color: colors.textMuted }]}>
              {user?.email ?? ''}
            </LegatoText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.sectionGap} />

        {/* ── Seção: Aparência ──────────────────────────── */}
        <LegatoText style={[styles.sectionLabel, { color: colors.textMuted }]}>APARÊNCIA</LegatoText>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsItem
            icon={isDarkTheme ? 'moon' : 'sunny'}
            label={isDarkTheme ? 'Tema escuro' : 'Tema claro'}
            sublabel="Alternar entre dark e light"
            control="switch"
            value={isDarkTheme}
            onToggle={toggleTheme}
            colors={colors}
          />
        </View>

        <View style={styles.sectionGap} />

        {/* ── Seção: Conta ──────────────────────────────── */}
        <LegatoText style={[styles.sectionLabel, { color: colors.textMuted }]}>CONTA</LegatoText>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsItem
            icon="mail-outline"
            label="E-mail"
            control="none"
            rightLabel={user?.email ?? '—'}
            colors={colors}
          />
          <SettingsItem
            icon="lock-closed-outline"
            label="Alterar senha"
            sublabel="Em breve"
            control="chevron"
            colors={colors}
          />
        </View>

        <View style={styles.sectionGap} />

        {/* ── Seção: Sobre ──────────────────────────────── */}
        <LegatoText style={[styles.sectionLabel, { color: colors.textMuted }]}>SOBRE</LegatoText>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsItem
            icon="information-circle-outline"
            label="Versão do app"
            control="none"
            rightLabel={appVersion}
            colors={colors}
          />
          <SettingsItem
            icon="school-outline"
            label="Fatec Zona Leste"
            sublabel="Projeto Integrador — 5º Semestre 2026"
            control="none"
            colors={colors}
          />
        </View>

        <View style={styles.sectionGap} />

        {/* ── Seção: Sair ───────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingsItem
            icon="log-out-outline"
            label="Sair da conta"
            onPress={confirmLogout}
            destructive
            control="none"
            colors={colors}
          />
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </AppTemplate>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  logo: {
    height: 28,
    width: 80,
  },
  headerSeparator: {
    fontSize: Typography.FontSize.md,
  },
  headerTitle: {
    fontSize: Typography.FontSize.md,
    fontWeight: '500',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.xs,
  },

  // Cartão de perfil
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: Typography.FontSize.md,
    fontWeight: '600',
  },
  profileUsername: {
    fontSize: Typography.FontSize.sm,
  },
  profileEmail: {
    fontSize: Typography.FontSize.xs,
  },

  // Seções
  sectionGap: {
    height: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.FontSize.xxs,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  section: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },

  bottomPad: {
    height: Spacing.xxl,
  },
});
