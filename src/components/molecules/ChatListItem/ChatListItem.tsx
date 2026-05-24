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
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';
import type { ChatListItemProps } from './ChatListItem.types';

export function ChatListItem({ userAvatar, userName, lastMessage, timeStamp, isOnline, onPress }: ChatListItemProps) {
    const colors = useColors();
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
                </View>
                <View style={styles.messageRow}>
                    <LegatoText style={[styles.lastMessage, { color: colors.textSecondary }]}>
                        {lastMessage}
                    </LegatoText>
                </View>
            </View>
            <View style={styles.timeStampContainer}>
                <LegatoText style={[styles.timeStamp, { color: colors.textMuted }]}>
                    {timeStamp}
                </LegatoText>
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
        marginTop: Spacing.xs,
    },
    messageRow: {
        marginBottom: Spacing.sm,
    },
    timeStampContainer: {
        marginLeft: Spacing.md,
    },
    contactName: {
        color: Colors.primary,
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.sm,
    },
    lastMessage: {
        fontSize: FontSize.xs,
    },
    timeStamp: {
        fontSize: FontSize.xs,
    },
});