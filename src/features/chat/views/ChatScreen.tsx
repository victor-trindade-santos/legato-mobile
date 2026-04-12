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
import { formatTimestamp } from '@/utils/dateUtils';

import { useChatViewModel, ChatListItem } from '../viewmodels/useChatViewModel';
import type { Message } from '../models/MessageModel';

import { ChatStackParamList } from '@/navigation/types';

// ════════════════════════════════════════════════════════════════════
// TIPOS
// ════════════════════════════════════════════════════════════════════

type ChatScreenRouteParams = RouteProp<ChatStackParamList, 'Chat'>;

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteParams>();
  const flatListRef = useRef<FlatList>(null);

  // ════════════════════════════════════════════════════════════════════
  // PROPS DA ROTA RECEBIDAS DE CHATLIST
  // ════════════════════════════════════════════════════════════════════
  const {
    conversationId,
    userName,
    avatarUri,
    receiverId,
  } = route.params || {};

  // ════════════════════════════════════════════════════════════════════
  // VIEWMODEL - TODA A LÓGICA AQUI
  // ════════════════════════════════════════════════════════════════════
  const { chatItems, isLoading, error, inputText, setInputText, handleSend } = useChatViewModel(conversationId, receiverId);


  // ════════════════════════════════════════════════════════════════════
  // LIFECYCLE - MARCAR COMO LIDO
  // ════════════════════════════════════════════════════════════════════
  // useEffect(() => {
  //   // ⚠️ Validação: só marca como lido se conversationId for válido
  //   if (!conversationId || conversationId === undefined) {
  //     console.warn('[ChatScreen] ⚠️ conversationId inválido, pulando markAsRead:', conversationId);
  //     return;
  //   }
  //   markAsRead();
  // }, [conversationId, markAsRead]);

  // ════════════════════════════════════════════════════════════════════
  // SCROLL AUTOMÁTICO
  // ════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (chatItems.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatItems]);

  // ════════════════════════════════════════════════════════════════════
  // RENDERIZADOR DE MENSAGENS
  // ════════════════════════════════════════════════════════════════════
  const renderMessage = ({ item }: { item: ChatListItem }) => {
    if (item.type === 'separator') {
      return <DaySeparator label={item.label} />;
    }

    const {data} = item;

    const content = (
      <MessageContent
        message={data.content}
        timestamp={formatTimestamp(data.timestamp)}
      />
    )
   
    return data.isMine ? (
      <MyMessageBubble>{content}</MyMessageBubble>
    ) : (
      <OtherUserMessageBubble>{content}</OtherUserMessageBubble>
    );
  };

  // ════════════════════════════════════════════════════════════════════
  // ESTADO DE CARREGAMENTO
  // ════════════════════════════════════════════════════════════════════
  if (isLoading) return <Spinner fullScreen />;


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
            // statusText={statusText}
            // statusVariant={statusVariant}
          />
        </View>
        {/* ── Lista de Mensagens ─────────────────────────── */}
        <FlatList
          ref={flatListRef}
          data={chatItems}
          keyExtractor={(item) => item.type === 'separator' ? item.key : item.data.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Sem mensagens ainda</Text>
            </View>
          }
        />
{/* 
        ── Connection Status Badge ──────────────────────–
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
        )} */}

       
        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          placeholder="Digite uma mensagem..."
        />

        {/* ── Errors ────────────────────────────────────– */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
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