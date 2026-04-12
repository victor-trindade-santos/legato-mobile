/**
 * LEGATO — AppNavigator (Root)
 *
 * Verifica o token no SecureStore ao iniciar o app.
 * Redireciona para AuthNavigator ou MainNavigator conforme estado.
 */

import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { storage } from '@/utils/storage';
import { View, ActivityIndicator } from 'react-native';

import { Config } from '@/constants/config';
import { isTokenValid } from '@/utils/tokenUtils';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api/axios';
import { Endpoints } from '@/services/api/endpoints';
import { Colors } from '@/theme';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import MusicianProfileScreen from '@/features/musicians/views/MusicianProfileScreen';
import ProfileEditScreen from '@/features/profile-edit/views/ProfileEditScreen';
import type { RootStackParamList } from './types';

const Root = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, needsOnboarding, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // DEV: bypass de autenticação para visualizar telas sem backend
        if (Config.DEV_BYPASS_AUTH) {
          setAuth('dev-token', {
            id: 1,
            username: 'dev_user',
            displayName: 'Dev User',
            email: 'dev@legato.com',
            role: 'USER',
          });
          return;
        }

        const token = await storage.getItem(Config.TOKEN_KEY);
        if (token && isTokenValid(token)) {
          const res = await api.get(Endpoints.users.me);
          const u = res.data;
          setAuth(token, {
            id: u.id,
            username: u.username,
            displayName: u.displayName,
            email: u.email,
            avatarUrl: u.profilePicture ?? undefined,
            role: u.role ?? 'USER',
          });
        }
      } catch {
        // Token inválido, mantém estado não autenticado
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundDark, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && needsOnboarding ? (
        // Onboarding: nome DIFERENTE de "ProfileEdit" para que, quando
        // needsOnboarding vira false, OnboardingEdit suma do navigator e
        // o React Navigation mostre Main automaticamente (sem ficar preso).
        <Root.Screen name="OnboardingEdit" component={ProfileEditScreen} />
      ) : isAuthenticated ? (
        <>
          <Root.Screen name="Main" component={MainNavigator} />
          <Root.Screen name="ProfileEdit" component={ProfileEditScreen} />
        </>
      ) : (
        <Root.Screen name="Auth" component={AuthNavigator} />
      )}
      <Root.Screen
        name="MusicianProfile"
        component={MusicianProfileScreen}
        options={{ presentation: 'modal' }}
      />
    </Root.Navigator>
  );
}
