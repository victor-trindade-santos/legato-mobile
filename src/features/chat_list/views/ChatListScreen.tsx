/**
 * ChatListScreen — View (Lista de Chats) — Victor
 * Lista de conversas com outros usuários
 */

import React from 'react';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { ChatStackParamList, RootStackParamList } from '@/navigation/types';
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

    if (isLoading) return <Spinner fullScreen />;

    return (
        <AppTemplate noPadding>
            {/* ── Controles rápidos ─────────────────────────── */}
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

            {/* Lista de chats */}
            <View style={styles.chatListContainer}>
                {chatItems.length === 0 ? (
                    <View style={styles.noChatsContainer}>
                        <LegatoText style={styles.noChatsText}>Nenhum chat encontrado</LegatoText>
                    </View>
                ) : (
                    <FlatList
                        data={chatItems}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <ChatListItem
                                userAvatar={item.otherUserProfilePictureUrl || ''}
                                userName={item.otherUserName}
                                lastMessage={item.lastMessageContent || 'Sem mensagens'}
                                timeStamp={item.lastMessageTimestamp || new Date().toISOString()}
                                onPress={() => {
                                    navigation.navigate('Chat');
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