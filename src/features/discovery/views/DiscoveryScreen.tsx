/**
 * DiscoveryScreen — View (Descoberta)
 *
 * Layout via AppTemplate (noPadding=true — cards são full-bleed).
 * Card centralizado verticalmente com margens superior e inferior.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { MusicianCard } from '@/components/molecules/MusicianCard/MusicianCard';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { useDiscoveryViewModel } from '../viewmodels/useDiscoveryViewModel';
import { FilterModal } from './FilterModal';
import { HistoryModal } from './HistoryModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.60;

export default function DiscoveryScreen() {
  const {
    cards,
    history,
    isLoading,
    filters,
    isFilterModalOpen,
    isHistoryModalOpen,
    handleSwipe,
    handleApplyFilters,
    setIsFilterModalOpen,
    setIsHistoryModalOpen,
  } = useDiscoveryViewModel();

  if (isLoading) return <Spinner fullScreen />;

  return (
    <AppTemplate noPadding>

      {/* ── Controles rápidos ─────────────────────────── */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={() => setIsFilterModalOpen(true)}>
          <Ionicons name="options-outline" size={14} color={Colors.white} />
          <LegatoText style={styles.controlLabel}>Filtrar</LegatoText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => setIsHistoryModalOpen(true)}>
          <Ionicons name="time-outline" size={14} color={Colors.white} />
          <LegatoText style={styles.controlLabel}>Histórico</LegatoText>
        </TouchableOpacity>
      </View>

      {/* ── Área central (centraliza o card verticalmente) ── */}
      <View style={styles.centerArea}>

        {/* Stack de cards */}
        <View style={styles.cardArea}>
          {cards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={Colors.textMuted} />
              <LegatoText variant="sectionTitle" color={Colors.textSecondaryDark} align="center">
                Não há mais músicos disponíveis
              </LegatoText>
              <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
                Tente ajustar os filtros ou volte mais tarde.
              </LegatoText>
            </View>
          ) : (
            cards.slice(0, 3).reverse().map((musician, index) => (
              <View
                key={musician.id}
                style={[
                  styles.cardWrapper,
                  {
                    zIndex: index,
                    transform: [{ scale: 1 - (2 - index) * 0.03 }],
                    top: (2 - index) * 6,
                  },
                ]}
              >
                <MusicianCard
                  musician={musician}
                  isTop={index === 2}
                  onSwipeLeft={() => handleSwipe(musician, 'dislike')}
                  onSwipeRight={() => handleSwipe(musician, 'like')}
                />
              </View>
            ))
          )}
        </View>

        {/* Hint */}
        {cards.length > 0 && (
          <LegatoText variant="caption" color={Colors.textMuted} align="center" style={styles.hint}>
            Arraste o card para a esquerda para ignorar, ou para a direita para conversar
          </LegatoText>
        )}
      </View>

      {/* ── Modais ────────────────────────────────────── */}
      <FilterModal
        visible={isFilterModalOpen}
        filters={filters}
        onApply={handleApplyFilters}
        onClose={() => setIsFilterModalOpen(false)}
      />
      <HistoryModal
        visible={isHistoryModalOpen}
        history={history}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </AppTemplate>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPaddingH,
    paddingBottom: Spacing.sm,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
  },
  controlLabel: {
    color: Colors.white,
    fontSize: Typography.FontSize.xs,
    fontWeight: Typography.FontWeight.semiBold,
  },

  // Container que centraliza verticalmente
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },

  // Card com altura fixa e margens laterais
  cardArea: {
    height: CARD_HEIGHT,
    marginHorizontal: Spacing.screenPaddingH,
  },
  cardWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  hint: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingTop: Spacing.sm,
    textAlign: 'center',
  },
});
