/**
 * ChatListScreen — View (Lista de Chats) — Victor
 * Lista de conversas com outros usuários
 */

import React from 'react';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { ChatStackParamList } from '@/navigation/types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { SearchInput } from '@/components/molecules/SearchInput/SearchInput';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { Colors } from '@/theme/colors';
import { LegatoText } from '@/components/atoms/Text/Text';
import { ChatListItem } from '@/components/molecules/ChatListItem/ChatListItem';
import { useChatListViewModel } from '../viewmodels/useChatListViewModel';
import { FlatList } from 'react-native-gesture-handler';
import { Spacing } from '@/theme';
import { formatChatTimestamp } from '@/utils/formatters';

type ChatListNav = StackNavigationProp<ChatStackParamList>;

export default function ChatListScreen() {
    const navigation = useNavigation<ChatListNav>();
    const {
        chatItems,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        handleSearch
    } = useChatListViewModel();

    return (
        <AppTemplate noPadding>
            {isLoading ? (
                <Spinner fullScreen />
            ) : (
                <>
                    {/* ── Busca ─────────────────────────────────── */}
                    <View style={styles.searchContainer}>
                        <SearchInput
                            placeholder="Buscar contatos"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSearchPress={handleSearch}
                            inputThemeOverride={{
                                background: styles.searchContainer.backgroundColor,
                                text: styles.searchContainer.color,
                                border: styles.searchContainer.borderColor,
                            }}
                        />
                    </View>
                    {/* ── Lista de Chats ─────────────────────────── */}
                    <FlatList
                        data={chatItems}
                        keyExtractor={(item, index) => String(item?.chatId ?? index)}
                        renderItem={({ item }) => {
                            return (
                                <ChatListItem
                                    userAvatar={item.otherUserProfilePictureUrl || ''}
                                    userName={item.otherUserName}
                                    lastMessage={item.lastMessageContent || 'Sem mensagens'}
                                    timeStamp={formatChatTimestamp(item.lastMessageTimestamp)}
                                    isOnline={item.isOnline}
                                    onPress={() => {
                                        console.log('[ChatList] → navegando para chat | user=', item.otherUserName, '| isOnline=', item.isOnline, '| lastSeen=', item.lastSeen);
                                        navigation.navigate('Chat', {
                                            conversationId: item.chatId,
                                            userName: item.otherUserName,
                                            avatarUri: item.otherUserProfilePictureUrl,
                                            receiverId: item.otherUserId,
                                            isOnline: item.isOnline,
                                            lastSeen: item.lastSeen,
                                        });
                                    }}
                                />
                            );
                        }}
                    />                    
                </>
                )}
        </AppTemplate>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
        backgroundColor: Colors.transparent,
        borderColor: Colors.transparent,
        color: Colors.textPrimaryDark,  
    },
    chatListContainer: {
        flexDirection: 'column',
    },
    noChatsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noChatsText: {
        color: Colors.textSecondaryDark,
    }
});