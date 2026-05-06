  /**
   * LEGATO — MainNavigator
   * Bottom Tabs para usuários autenticados.
   * Badge de notificações via notificationStore (Zustand).
   */

import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { Colors, Spacing, Typography } from '@/theme';
import { useNotificationStore } from '@/store/notificationStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { getUnreadCount } from '@/features/notifications/services/notificationService';

  // Screens
  import DiscoveryScreen from '@/features/discovery/views/DiscoveryScreen';
  import ConnectionScreen from '@/features/connection/views/ConnectionScreen';
  import NotificationsScreen from '@/features/notifications/views/NotificationsScreen';
  import ChatNavigator from './ChatNavigator';

  // Placeholders para as features dos outros devs
  import FeedScreen from '@/features/feed/views/FeedScreen';
  import ProfileScreen from '@/features/profile/views/ProfileScreen';
  import MusicianProfileScreen from '@/features/musicians/views/MusicianProfileScreen';

  const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const { theme } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }, []);

    const isDark = theme === 'dark';
    const bgColor = isDark ? Colors.surfaceDark : Colors.surfaceLight;
    const activeColor = Colors.primary;
    const inactiveColor = isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight;

    return (
      <Tab.Navigator
        sceneContainerStyle={{ backgroundColor: bgColor }}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: bgColor,
            borderTopWidth: 0,
            height: Spacing.tabBarHeight,
            paddingBottom: Spacing.sm,
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarLabelStyle: {
            fontSize: Typography.FontSize.xxs,
            fontWeight: Typography.FontWeight.medium,
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Discovery') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Feed') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Collaborations') {
              iconName = focused ? 'musical-notes' : 'musical-notes-outline';
            } else if (route.name === 'ChatTab') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Notifications') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            // Tamanho fixo — não deixar o React Navigation auto-escalar com tabBarHeight
            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Discovery"
          component={DiscoveryScreen}
          options={{ tabBarLabel: 'Descoberta' }}
        />
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{ tabBarLabel: 'Feed' }}
        />
        <Tab.Screen
          name="Collaborations"
          component={ConnectionScreen}
          options={{ tabBarLabel: 'Conexões' }}
        />
        <Tab.Screen
          name="ChatTab"
          component={ChatNavigator}
          options={{ tabBarLabel: 'Chats' }}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            tabBarLabel: 'Notificações',
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            tabBarBadgeStyle: { backgroundColor: Colors.error },
          }}
        />
        <Tab.Screen
          name="Profile"
          component={MusicianProfileScreen}
          options={{ tabBarLabel: 'Perfil' }}
        />
      </Tab.Navigator>
    );
  }
