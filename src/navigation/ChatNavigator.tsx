/**
 * LEGATO — ChatNavigator
 * Stack Navigator para a feature de Chats
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { ChatStackParamList } from './types';

import ChatListScreen from '@/features/chat_list/views/ChatListScreen';

const Stack = createStackNavigator<ChatStackParamList>();

export default function ChatNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
      />
      {/* ChatConversation será adicionado aqui quando implementado */}
    </Stack.Navigator>
  );
}
