/**
 * AppHeader — Molecule
 *
 * Header compartilhado por todas as telas do MainNavigator.
 * Contém: logo (ou título), busca, notificações (com badge) e configurações.
 *
 * Lógica interna:
 *  - Badge de notificações lido do notificationStore (Zustand)
 *  - Navegação para Notifications e Settings via useNavigation
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNotificationStore } from '@/store/notificationStore';
import { useUIStore } from '@/store/uiStore';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { useColors } from '@/hooks/useColors';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import type { AppHeaderProps } from './AppHeader.types';

type MainNav = BottomTabNavigationProp<MainTabParamList>;
type RootNav = StackNavigationProp<RootStackParamList>;

export function AppHeader({
  title,
  hideSearch = false,
  hideNotifications = false,
  hideSettings = false,
  onSearchPress,
  onSettingsPress,
  onNotificationsPress,
}: AppHeaderProps) {
  const navigation = useNavigation<MainNav>();
  const { unreadCount } = useNotificationStore();
  const colors = useColors();
  const isDark = useUIStore((s) => s.theme) === 'dark';

  const handleNotifications = () => {
    if (onNotificationsPress) { onNotificationsPress(); return; }
    navigation.navigate('Notifications');
  };
  const handleSettings = () => {
    if (onSettingsPress) { onSettingsPress(); return; }
    // Sobe para o RootStack e navega para Settings
    navigation.getParent<RootNav>()?.navigate('Settings');
  };
  const handleSearch = () => {
    if (onSearchPress) onSearchPress();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Logo ou título */}
      {title ? (
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      ) : (
        <Image
          source={isDark
            ? require('@/assets/icons/legato_logo_horizontal_dark_version.png')
            : require('@/assets/icons/legato_logo_horizontal_light_version.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      )}

      {/* Ações */}
      <View style={styles.actions}>
        {/* {!hideSearch && (
          <TouchableOpacity style={styles.iconBtn} onPress={handleSearch}>
            <Ionicons name="search-outline" size={Spacing.iconLg} color={colors.textPrimary} />
          </TouchableOpacity>
        )} */}

        {!hideNotifications && (
          <TouchableOpacity style={styles.iconBtn} onPress={handleNotifications}>
            <Ionicons name="notifications-outline" size={Spacing.iconLg} color={colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {!hideSettings && (
          <TouchableOpacity style={styles.iconBtn} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={Spacing.iconLg} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.sm,
  },
  logo: {
    color: Colors.primaryDark,
    fontSize: Typography.FontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  logoImage: {
    height: 48,
    width: 120,
  },
  title: {
    fontSize: Typography.FontSize.lg,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
});
