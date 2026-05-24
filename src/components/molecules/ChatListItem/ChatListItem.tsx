/**
 * ChatListItem - Molecule
 * 
 * Estrutura -
 * - Avatar do contato - Atoms/Avatar
 * - Nome do contato - Atoms/Text
 * - Última mensagem - Atoms/Text
 * - Data da última mensagem - Atoms/Text
 * 
 * Usado em ChatListScreen:
 *  <ChatListItem key={chatItem.id} chat={chatItem} onPress={() => navigation.navigate('ChatDetail', { chatId: chatItem.id })} />
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { LegatoText } from '@/components/atoms/Text/Text';
import { StatusDot } from '@/components/atoms/StatusDot/StatusDot';
import { Icon } from '@/components/atoms/Icon/Icon';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';
import type { MediaType } from '@/types/WebSocket.types';
import type { ChatListItemProps } from './ChatListItem.types';

const MEDIA_LABELS: Record<Exclude<MediaType, 'NONE' | 'FILE'>, { icon: string; label: string }> = {
  IMAGE: { icon: 'image-outline', label: 'Foto' },
  VIDEO: { icon: 'videocam-outline', label: 'Vídeo' },
  AUDIO: { icon: 'mic-outline', label: 'Áudio de voz' },
};

export function ChatListItem({ userAvatar, userName, lastMessage, lastMessageType, timeStamp, isOnline, isTyping, onPress }: ChatListItemProps) {
    const colors = useColors();

    const mediaInfo = lastMessageType && lastMessageType !== 'NONE' && lastMessageType !== 'FILE'
        ? MEDIA_LABELS[lastMessageType]
        : null;

    return (
        <TouchableOpacity style={styles.chatItemContainer} onPress={onPress}>
            <View style={styles.avatarContainer}>
                <Avatar size="sm" uri={userAvatar} fallbackInitials={userName} />
                {isOnline && (
                    <View style={styles.onlineDot}>
                        <StatusDot variant="online" size={10} />
                    </View>
                )}
            </View>
            <View style={styles.textContainer}>
                <View style={styles.nameRow}>
                    <LegatoText style={styles.contactName}>
                        {userName}
                    </LegatoText>
                    <LegatoText style={[styles.timeStamp, { color: colors.textMuted }]}>
                        {timeStamp}
                    </LegatoText>
                </View>
                <View style={styles.messageRow}>
                    {isTyping ? (
                        <LegatoText
                            style={[styles.lastMessage, styles.typingText, { color: colors.textSecondary }]}
                            numberOfLines={1}
                        >
                            digitando...
                        </LegatoText>
                    ) : mediaInfo ? (
                        <View style={styles.mediaPreviewRow}>
                            <Icon
                                variant="vector"
                                family="Ionicons"
                                name={mediaInfo.icon as any}
                                size={13}
                                color={colors.textSecondary}
                            />
                            <LegatoText
                                style={[styles.lastMessage, styles.mediaLabel, { color: colors.textSecondary }]}
                                numberOfLines={1}
                            >
                                {mediaInfo.label}
                            </LegatoText>
                        </View>
                    ) : (
                        <LegatoText
                            style={[styles.lastMessage, { color: colors.textSecondary }]}
                            numberOfLines={1}
                        >
                            {lastMessage}
                        </LegatoText>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chatItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md
    },
    avatarContainer: {
        marginRight: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    textContainer: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    messageRow: {
        marginBottom: Spacing.sm,
    },
    contactName: {
        color: Colors.primary,
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.sm,
    },
    lastMessage: {
        fontSize: FontSize.xs,
    },
    typingText: {
        fontStyle: 'italic',
    },
    timeStamp: {
        fontSize: FontSize.xs,
    },
    mediaPreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    mediaLabel: {
        fontSize: FontSize.xs,
    },
});