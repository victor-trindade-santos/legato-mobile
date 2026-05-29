/**
 * LEGATO — ChatNavigator
 * Stack Navigator para a feature de Chats
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { ChatStackParamList } from './types';

import ChatListScreen from '@/features/chat_list/views/ChatListScreen';
import ChatScreen from '@/features/chat/views/ChatScreen';


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
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
        />
    </Stack.Navigator>
  );
}
