import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { Colors, Spacing } from '@/theme';

import { ChatHeaderUserInfo } from '@/components/molecules/ChatHeaderUserInfo/ChatHeaderUserInfo';
import { DaySeparator } from '@/components/molecules/DaySeparator/DaySeparator';
import { MyMessageBubble } from '@/components/molecules/MyMessageBubble/MyMessageBubble';
import { OtherUserMessageBubble } from '@/components/molecules/OtherUserMessageBubble/OtherUserMessageBubble';
import { MessageContent } from '@/components/molecules/MessageContent/MessageContent';
import { UnreadMessagesBadge } from '@/components/molecules/UnreadMessagesBadge/UnreadMessagesBadge';
import { TypingIndicator } from '@/components/molecules/TypingIndicator/TypingIndicator';
import { ChatInputBar } from '@/components/molecules/ChatInputBar/ChatInputBar';
import { Spinner } from '@/components/atoms/Spinner/Spinner';

type Message = {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  dayLabel?: string;
};

export default function ChatScreen() {
  const flatListRef = useRef<FlatList>(null);

  const [loading] = useState(false);
  const [typing] = useState(true);
  const [input, setInput] = useState('');

  // MOCK de mensagens só para visualizar a arquitetura funcionando
  const messages: Message[] = [
    { id: 'd1', text: '', timestamp: '', isMine: false, dayLabel: 'Hoje' },

    {
      id: '1',
      text: 'Oi, você já viu isso?',
      timestamp: '14:32',
      isMine: false,
    },
    {
      id: '2',
      text: 'Ainda não, me manda!',
      timestamp: '14:33',
      isMine: true,
      status: 'read',
    },
  ];

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const renderItem = ({ item }: { item: Message }) => {
    if (item.dayLabel) {
      return <DaySeparator label={item.dayLabel} />;
    }

    const content = (
      <MessageContent
        message={item.text}
        timestamp={item.timestamp}
        statusElement={
          item.isMine && item.status ? (
            <UnreadMessagesBadge status={item.status} />
          ) : undefined
        }
      />
    );

    if (item.isMine) {
      return <MyMessageBubble>{content}</MyMessageBubble>;
    }

    return <OtherUserMessageBubble>{content}</OtherUserMessageBubble>;
  };

  if (loading) return <Spinner fullScreen />;

  return (
    <AppTemplate noPadding>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <ChatHeaderUserInfo
            name="João Silva"
            fallbackInitials="JS"
            statusText="online"
            statusVariant="online"
          />
        </View>

        {/* Lista de mensagens */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />

        {/* Typing indicator */}
        {typing && (
          <TypingIndicator userName="João" />
        )}

        {/* Input */}
        <ChatInputBar
          value={input}
          onChangeText={setInput}
          onSend={() => {}}
        />
      </View>
    </AppTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.sm,
  },
});