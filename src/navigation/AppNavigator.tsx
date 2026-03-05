/**
 * LEGATO — AppNavigator (Root)
 *
 * Verifica o token no SecureStore ao iniciar o app.
 * Redireciona para AuthNavigator ou MainNavigator conforme estado.
 */

import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';

import { Config } from '@/constants/config';
import { isTokenValid } from '@/utils/tokenUtils';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/theme';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import type { RootStackParamList } from './types';

const Root = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await SecureStore.getItemAsync(Config.TOKEN_KEY);
        if (token && isTokenValid(token)) {
          // Token válido — restaura sessão
          // user será carregado pelo useQuery('me') na primeira tela
          setAuth(token, {
            id: 0,
            username: '',
            displayName: '',
            email: '',
            role: 'USER',
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
      {isAuthenticated ? (
        <Root.Screen name="Main" component={MainNavigator} />
      ) : (
        <Root.Screen name="Auth" component={AuthNavigator} />
      )}
    </Root.Navigator>
  );
}
