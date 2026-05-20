/**
 * LEGATO — AuthNavigator
 * Stack de telas não autenticadas: Splash → Login → Signup → ForgotPassword
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';

import SplashScreen from '@/features/auth/views/SplashScreen';
import LoginScreen from '@/features/auth/views/LoginScreen';
import SignupScreen from '@/features/auth/views/SignupScreen';
import ForgotPasswordScreen from '@/features/auth/views/ForgotPasswordScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
