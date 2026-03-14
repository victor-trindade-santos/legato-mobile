/**
 * HistoryModal — Feature: Discovery
 * Exibe o histórico de swipes (músicos curtidos e ignorados).
 * Permite ordenar por mais recente ou mais antigo.
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalTemplate } from '@/components/templates/ModalTemplate/ModalTemplate';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { Tag } from '@/components/atoms/Tag/Tag';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { formatDistance } from '@/utils/formatters';
import type { Musician } from '../models/Musician';

type SwipeHistoryEntry = { musician: Musician; direction: 'like' | 'dislike' };
type SortOrder = 'newest' | 'oldest';

interface HistoryModalProps {
  visible: boolean;
  history: SwipeHistoryEntry[];
  onClose: () => void;
}

export function HistoryModal({ visible, history, onClose }: HistoryModalProps) {
  const [order, setOrder] = useState<SortOrder>('newest');

  const sorted = order === 'newest' ? [...history].reverse() : history;

  const toggleOrder = () => setOrder(prev => prev === 'newest' ? 'oldest' : 'newest');

  const renderItem = ({ item }: { item: SwipeHistoryEntry }) => {
    const isLike = item.direction === 'like';
    return (
      <View style={styles.item}>
        <Avatar uri={item.musician.avatarUrl} size="md" fallbackInitials={item.musician.displayName} />
        <View style={styles.itemInfo}>
          <LegatoText style={styles.itemName}>
            {item.musician.displayName}, {item.musician.age}
          </LegatoText>
          <LegatoText style={styles.itemSub}>
            {formatDistance(item.musician.distance)}
          </LegatoText>
          <View style={styles.itemTags}>
            {item.musician.skills.slice(0, 2).map(s => (
              <Tag key={s} label={s} color={Colors.primaryLight} />
            ))}
          </View>
        </View>
        <View style={[styles.swipeBadge, isLike ? styles.swipeLike : styles.swipeDislike]}>
          <Ionicons
            name={isLike ? 'heart' : 'close'}
            size={18}
            color={isLike ? Colors.swipeLike : Colors.swipeDislike}
          />
        </View>
      </View>
    );
  };

  return (
    <ModalTemplate visible={visible} onClose={onClose}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <LegatoText variant="sectionTitle" color={Colors.white}>Histórico de Descoberta</LegatoText>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={Spacing.iconLg} color={Colors.textSecondaryDark} />
        </TouchableOpacity>
      </View>

      {/* Botão de ordenação */}
      {history.length > 0 && (
        <TouchableOpacity style={styles.sortBtn} onPress={toggleOrder}>
          <Ionicons
            name={order === 'newest' ? 'arrow-down' : 'arrow-up'}
            size={14}
            color={Colors.primary}
          />
          <LegatoText style={styles.sortLabel}>
            {order === 'newest' ? 'Mais Recente → Mais Antigo' : 'Mais Antigo → Mais Recente'}
          </LegatoText>
        </TouchableOpacity>
      )}

      {/* Lista */}
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={40} color={Colors.textMuted} />
          <LegatoText style={styles.emptyText}>Nenhum músico visualizado ainda.</LegatoText>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </ModalTemplate>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  sortLabel: {
    color: Colors.primary,
    fontSize: Typography.FontSize.xs,
    fontWeight: Typography.FontWeight.medium,
  },
  list: {
    maxHeight: 380,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    color: Colors.white,
    fontSize: Typography.FontSize.sm,
    fontWeight: Typography.FontWeight.semiBold,
  },
  itemSub: {
    color: Colors.textMuted,
    fontSize: Typography.FontSize.xxs,
  },
  itemTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 2,
  },
  swipeBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeLike: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
  },
  swipeDislike: {
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.FontSize.sm,
  },
});
