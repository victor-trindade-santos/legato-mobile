/**
 * ChatListScreen — View (Lista de Chats) — Victor
 * Lista de conversas com outros usuários
 */

import React from 'react';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { RootStackParamList } from '@/navigation/types';
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

type ChatListNav = StackNavigationProp<RootStackParamList>;

export default function ChatListScreen() {
    const navigation = useNavigation<ChatListNav>();
    const {
        chatItems,
        isLoading,
        error
    } = useChatListViewModel();

    if (isLoading) return <Spinner fullScreen />;

    return (
        <AppTemplate noPadding>
            {/* ── Controles rápidos ─────────────────────────── */}
            <View style={styles.searchContainer}>
                <SearchInput placeholder="Buscar contatos"/>
            </View>

            {/* Lista de chats */}
            <View style={styles.chatListContainer}>
                {chatItems.length === 0 ? (
                    <View style={styles.noChatsContainer}>
                        <LegatoText style={styles.noChatsText}>Nenhum chat encontrado</LegatoText>
                    </View>
                ) : (
                    <FlatList
                        data={chatItems}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ChatListItem
                                userAvatar={item.avatarUrl || ''}
                                userName={item.name}
                                lastMessage={item.lastMessage}
                                timeStamp={item.timeStamp}
                                onPress={() => {
                                    // TODO: Navegar para ChatConversation
                                    // navigation.navigate('ChatConversation', {
                                    //   conversationId: item.id,
                                    //   userName: item.name,
                                    // });
                                }}
                            />
                        )}
                    />                    
                )}
            </View>
        </AppTemplate>
    );
}

const styles = StyleSheet.create({
    searchContainer: {

        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
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