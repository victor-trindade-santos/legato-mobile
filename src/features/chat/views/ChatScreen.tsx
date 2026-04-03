/**
 * ChatScreen — Dumb Component
 *
 * Responsabilidades:
 * ✓ Renderizar componentes (Header, List, Input, etc)
 * 
 * NÃO faz:
 * ✗ Lógica de negócio
 * ✗ Estado local (a não ser UI necessário)
 * ✗ Gerenciamento de WebSocket
 * ✗ HTTP requests
 *
 * Toda a lógica fica em:
 * - useChatViewModel (orquestração)
 * - ChatStore (estado global)
 * - ChatService (HTTP)
 * - WebSocketService (tempo real)
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ChatHeaderUserInfo } from '@/components/molecules/ChatHeaderUserInfo/ChatHeaderUserInfo';
import { DaySeparator } from '@/components/molecules/DaySeparator/DaySeparator';
import { MyMessageBubble } from '@/components/molecules/MyMessageBubble/MyMessageBubble';
import { OtherUserMessageBubble } from '@/components/molecules/OtherUserMessageBubble/OtherUserMessageBubble';
import { MessageContent } from '@/components/molecules/MessageContent/MessageContent';
import { UnreadMessagesBadge } from '@/components/molecules/UnreadMessagesBadge/UnreadMessagesBadge';
import { TypingIndicator } from '@/components/molecules/TypingIndicator/TypingIndicator';
import { ChatInputBar } from '@/components/molecules/ChatInputBar/ChatInputBar';
import { Spinner } from '@/components/atoms/Spinner/Spinner';

import { useChatViewModel } from '../viewmodels/useChatViewModel';
import type { Message } from '../models/MessageModel';

// ════════════════════════════════════════════════════════════════════
// TIPOS
// ════════════════════════════════════════════════════════════════════

type ChatScreenRouteParams = {
  Chat: {
    conversationId: number;
    userName: string;
    avatarUri?: string;
    statusText?: string;
    statusVariant?: 'online' | 'offline' | 'away';
  };
};

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ChatScreenRouteParams, 'Chat'>>();
  const flatListRef = useRef<FlatList>(null);

  // ════════════════════════════════════════════════════════════════════
  // PROPS DA ROTA
  // ════════════════════════════════════════════════════════════════════
  const {
    conversationId,
    userName,
    avatarUri,
    statusText = 'online',
    statusVariant = 'online',
  } = route.params || {};

  // ════════════════════════════════════════════════════════════════════
  // VIEWMODEL - TODA A LÓGICA AQUI
  // ════════════════════════════════════════════════════════════════════
  const viewModel = useChatViewModel(conversationId);

  const {
    messages,
    connectionStatus,
    isLoadingMessages,
    typingUsers,
    errors,
    inputValue,
    isSending,
    onInputChange,
    sendMessage,
    markAsRead,
  } = viewModel;

  // ════════════════════════════════════════════════════════════════════
  // LIFECYCLE - MARCAR COMO LIDO
  // ════════════════════════════════════════════════════════════════════
  useEffect(() => {
    markAsRead();
  }, [conversationId, markAsRead]);

  // ════════════════════════════════════════════════════════════════════
  // SCROLL AUTOMÁTICO
  // ════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // ════════════════════════════════════════════════════════════════════
  // RENDERIZADOR DE MENSAGENS
  // ════════════════════════════════════════════════════════════════════
  const renderMessage = ({ item }: { item: Message }) => {
    // Separador de dia
    if (!item.content) {
      return <DaySeparator label={item.senderName} />;
    }

    const content = (
      <MessageContent
        message={item.content}
        timestamp={item.timestamp}
        statusElement={
          item.isMine && item.status ? (
            <UnreadMessagesBadge status={item.status} />
          ) : undefined
        }
      />
    );

    return item.isMine ? (
      <MyMessageBubble>{content}</MyMessageBubble>
    ) : (
      <OtherUserMessageBubble>{content}</OtherUserMessageBubble>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // ESTADO DE CARREGAMENTO
  // ════════════════════════════════════════════════════════════════════
  if (isLoadingMessages && messages.length === 0) {
    return <Spinner fullScreen />;
  }

  // ════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO
  // ════════════════════════════════════════════════════════════════════
  return (
    <AppTemplate noPadding>
      <View style={styles.container}>
        {/* ── Header ──────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons
              name="arrow-back"
              size={Spacing.iconXl}
              color={Colors.white}
            />
          </TouchableOpacity>
          <ChatHeaderUserInfo
            name={userName}
            fallbackInitials={userName
              ?.split(' ')
              .map((n) => n[0])
              .join('')}
            avatarUri={avatarUri}
            statusText={statusText}
            statusVariant={statusVariant}
          />
        </View>

        {/* ── Connection Status Badge ──────────────────────– */}
        {connectionStatus !== 'connected' && (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  connectionStatus === 'connecting' ||
                  connectionStatus === 'reconnecting'
                    ? Colors.warning
                    : Colors.error,
              },
            ]}
          >
            <ActivityIndicator
              size="small"
              color={Colors.white}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: Colors.white,
                fontSize: FontSize.xs,
                fontWeight: FontWeight.semiBold,
              }}
            >
              {connectionStatus === 'connecting'
                ? 'Conectando...'
                : connectionStatus === 'reconnecting'
                  ? 'Reconectando...'
                  : connectionStatus === 'error'
                    ? 'Erro de conexão'
                    : 'Desconectado'}
            </Text>
          </View>
        )}

        {/* ── Lista de Mensagens ──────────────────────────– */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isLoadingMessages ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Sem mensagens ainda</Text>
              </View>
            ) : null
          }
        />

        {/* ── Typing Indicator ──────────────────────────── */}
        {typingUsers.length > 0 && (
          <TypingIndicator userName={typingUsers[0]} />
        )}

        {/* ── Input ──────────────────────────────────────– */}
        <ChatInputBar
          value={inputValue}
          onChangeText={onInputChange}
          onSend={sendMessage}
          placeholder="Digite uma mensagem..."
        />

        {/* ── Errors ────────────────────────────────────– */}
        {errors.length > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errors[0]}</Text>
          </View>
        )}
      </View>
    </AppTemplate>
  );
}

// ════════════════════════════════════════════════════════════════════
// Styles
// ════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.screenPaddingH,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: Colors.textSecondaryDark,
    fontSize: FontSize.sm,
  },
  errorBanner: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.screenPaddingH,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
  },
});