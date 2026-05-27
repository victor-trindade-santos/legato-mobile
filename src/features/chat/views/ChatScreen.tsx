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

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';
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
import { ImageViewerModal } from '@/components/molecules/ImageViewerModal/ImageViewerModal';
import { VideoPlayerModal } from '@/components/molecules/VideoPlayerModal/VideoPlayerModal';
import { AttachmentSheet } from '@/components/molecules/AttachmentSheet/AttachmentSheet';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { formatTimestamp } from '@/utils/dateUtils';
import { formatLastSeen } from '@/utils/formatters';

import { useChatViewModel, ChatListItem } from '../viewmodels/useChatViewModel';
import { getChatFileDownloadParams } from '../services/ChatService';
import { downloadFile } from '@/utils/downloadFile';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import type { Message } from '../models/MessageModel';

import { ChatStackParamList } from '@/navigation/types';

// ════════════════════════════════════════════════════════════════════
// TIPOS
// ════════════════════════════════════════════════════════════════════

type ChatScreenRouteParams = RouteProp<ChatStackParamList, 'Chat'>;

export default function ChatScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteParams>();
  const flatListRef = useRef<FlatList>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const isScrollingRef = useRef<boolean>(false);

  const scrollToBottomIfNear = useCallback(() => {
    if (!isNearBottomRef.current) return;
    isScrollingRef.current = true;
    flatListRef.current?.scrollToEnd({ animated: true });
    // Fallback: if already at bottom, onMomentumScrollEnd won't fire
    setTimeout(() => { isScrollingRef.current = false; }, 600);
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingRef.current) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    isNearBottomRef.current = distanceFromBottom < 150;
  }, []);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isScrollingRef.current = false;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    isNearBottomRef.current = distanceFromBottom < 150;
  }, []);

  // ════════════════════════════════════════════════════════════════════
  // PROPS DA ROTA RECEBIDAS DE CHATLIST
  // ════════════════════════════════════════════════════════════════════
  const {
    conversationId,
    userName,
    avatarUri,
    receiverId,
    receiverUsername,
    isOnline,
    lastSeen,
  } = route.params || {};

  // ════════════════════════════════════════════════════════════════════
  // VIEWMODEL - TODA A LÓGICA AQUI
  // ════════════════════════════════════════════════════════════════════
  const { chatItems, isLoading, error, inputText, setInputText, handleSend, handleAttach, handleAttachAudio, handleAttachDocument, handleMic, isOtherUserTyping, presenceStatus } = useChatViewModel(conversationId, receiverId, isOnline, lastSeen);

  const { isRecording, recordingDurationMs, startRecording, stopRecording, cancelRecording } = useAudioRecorder();

  const handleMicPress = useCallback(async () => {
    console.log('[ChatScreen] handleMicPress | isRecording=', isRecording);
    if (isRecording) {
      const result = await stopRecording();
      console.log('[ChatScreen] stopRecording retornou:', result);
      if (result) {
        console.log('[ChatScreen] chamando handleMic com asset:', result);
        await handleMic({ uri: result.uri, mimeType: result.mimeType, fileName: result.fileName });
      } else {
        console.warn('[ChatScreen] ⚠️ stopRecording retornou null — áudio não enviado');
      }
    } else {
      console.log('[ChatScreen] iniciando gravação...');
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, handleMic]);

  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    senderName: string;
    timestamp: string;
  } | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    senderName: string;
    timestamp: string;
  } | null>(null);

  const [attachmentSheetVisible, setAttachmentSheetVisible] = useState(false);
  const [profileImageVisible, setProfileImageVisible] = useState(false);

  const handlePickMedia = useCallback(() => {
    setAttachmentSheetVisible(false);
    setTimeout(() => handleAttach(), 300);
  }, [handleAttach]);

  const handlePickAudio = useCallback(() => {
    setAttachmentSheetVisible(false);
    setTimeout(() => handleAttachAudio(), 300);
  }, [handleAttachAudio]);

  const handlePickDocument = useCallback(() => {
    setAttachmentSheetVisible(false);
    setTimeout(() => handleAttachDocument(), 300);
  }, [handleAttachDocument]);


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
  // DEBUG — PARAMS + PRESENÇA
  // ════════════════════════════════════════════════════════════════════
  useEffect(() => {
    console.log('[ChatScreen] mount | receiverId=', receiverId, '| isOnline(snapshot)=', isOnline, '| lastSeen(snapshot)=', lastSeen);
  }, []);

  useEffect(() => {
    console.log('[ChatScreen] presenceStatus →', presenceStatus);
  }, [presenceStatus]);

  useEffect(() => {
    console.log('[ChatScreen] isOtherUserTyping →', isOtherUserTyping);
  }, [isOtherUserTyping]);

  // ════════════════════════════════════════════════════════════════════
  // SCROLL AUTOMÁTICO — typing indicator
  // ════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isOtherUserTyping) return;
    const timer = setTimeout(() => scrollToBottomIfNear(), 100);
    return () => clearTimeout(timer);
  }, [isOtherUserTyping, scrollToBottomIfNear]);

  // ════════════════════════════════════════════════════════════════════
  // RENDERIZADOR DE MENSAGENS
  // ════════════════════════════════════════════════════════════════════
  const renderMessage = ({ item }: { item: ChatListItem }) => {
    if (item.type === 'separator') {
      return <DaySeparator label={item.label} />;
    }

    const {data} = item;

    const messageContent = (
      <MessageContent
        message={data.content}
        timestamp={formatTimestamp(data.timestamp)}
        typeMedia={data.typeMedia}
        mediaUrl={data.mediaUrl}
        mediaWidth={data.mediaWidth}
        mediaHeight={data.mediaHeight}
        thumbnailUrl={data.thumbnailUrl}
        audioType={data.audioType}
        isMine={data.isMine}
        onDownloadRequest={data.typeMedia === 'FILE' && !data.id.startsWith('local-') ? async () => {
          const { url, headers } = await getChatFileDownloadParams(conversationId, Number(data.id));
          await downloadFile(url, data.content ?? 'documento', headers);
        } : undefined}
        onImagePress={(url) => setSelectedImage({
          url,
          senderName: data.senderName,
          timestamp: formatTimestamp(data.timestamp),
        })}
        onVideoPress={(url) => setSelectedVideo({
          url,
          senderName: data.senderName,
          timestamp: formatTimestamp(data.timestamp),
        })}
      />
    );

    if (data.isMine) {
      return (
        <View style={styles.myMessageWrapper}>
          <MyMessageBubble>{messageContent}</MyMessageBubble>
          <View style={styles.badgeRow}>
            <UnreadMessagesBadge status={data.status ?? 'sending'} />
          </View>
        </View>
      );
    }

    return <OtherUserMessageBubble>{messageContent}</OtherUserMessageBubble>;
  };

  // ════════════════════════════════════════════════════════════════════
  // ESTADO DE CARREGAMENTO
  // ════════════════════════════════════════════════════════════════════
  if (isLoading) return <Spinner fullScreen />;


  // ════════════════════════════════════════════════════════════════════
  // RENDERIZAÇÃO
  // ════════════════════════════════════════════════════════════════════
  const chatStatusText = presenceStatus.isOnline
    ? 'Online'
    : presenceStatus.lastSeen
      ? `Visto por último ${formatLastSeen(presenceStatus.lastSeen)}`
      : undefined;

  return (
    <AppTemplate noPadding>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* ── Header ──────────────────────────────────────── */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons
              name="arrow-back"
              size={Spacing.iconXl}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <ChatHeaderUserInfo
            name={userName}
            fallbackInitials={userName
              ?.split(' ')
              .map((n) => n[0])
              .join('')}
            avatarUri={avatarUri}
            statusText={chatStatusText}
            onAvatarPress={avatarUri ? () => setProfileImageVisible(true) : undefined}
            onNamePress={receiverId ? () => (navigation as any).navigate('MusicianProfile', { musicianId: receiverId, username: receiverUsername, displayName: userName, connected: true, conversationId }) : undefined}
          />
        </View>
        {/* ── Lista de Mensagens ─────────────────────────── */}
        <FlatList
          ref={flatListRef}
          data={chatItems}
          keyExtractor={(item) => item.type === 'separator' ? item.key : item.data.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={scrollToBottomIfNear}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sem mensagens ainda</Text>
            </View>
          }
          ListFooterComponent={
            isOtherUserTyping ? <TypingIndicator userName={userName} showUserName={false} /> : null
          }
        />
        
        {/* ── Errors ────────────────────────────────────– */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          onAttach={() => setAttachmentSheetVisible(true)}
          onMic={handleMicPress}
          onCancelRecording={cancelRecording}
          isRecording={isRecording}
          recordingDurationMs={recordingDurationMs}
          placeholder="Digite uma mensagem..."
        />
      </View>

      <ImageViewerModal
        visible={selectedImage !== null}
        imageUrl={selectedImage?.url ?? ''}
        senderName={selectedImage?.senderName ?? ''}
        timestamp={selectedImage?.timestamp ?? ''}
        onClose={() => setSelectedImage(null)}
      />

      <ImageViewerModal
        visible={profileImageVisible}
        imageUrl={avatarUri ?? ''}
        senderName={userName ?? ''}
        statusText={chatStatusText}
        onClose={() => setProfileImageVisible(false)}
      />

      <VideoPlayerModal
        visible={selectedVideo !== null}
        mediaUrl={selectedVideo?.url ?? ''}
        senderName={selectedVideo?.senderName ?? ''}
        timestamp={selectedVideo?.timestamp ?? ''}
        onClose={() => setSelectedVideo(null)}
      />

      <AttachmentSheet
        visible={attachmentSheetVisible}
        onClose={() => setAttachmentSheetVisible(false)}
        onPickMedia={handlePickMedia}
        onPickAudio={handlePickAudio}
        // onPickDocument={handlePickDocument}
      />
    </AppTemplate>
  );
}

// ════════════════════════════════════════════════════════════════════
// Styles
// ════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
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
  myMessageWrapper: {},
  badgeRow: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
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