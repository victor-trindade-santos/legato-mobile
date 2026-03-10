/**
 * DiscoveryScreen — View (Descoberta)
 *
 * Tela principal de descoberta de músicos com swipe de cards.
 * Toda a lógica está em useDiscoveryViewModel.
 *
 * Layout:
 *   Header   → logo Legato + ícones (busca, sino, engrenagem)
 *   Controles → botões pill "Filtrar" e "Histórico"
 *   Cards    → stack de MusicianCards com swipe
 *   Hint     → instrução de swipe na base
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { MusicianCard } from '@/components/molecules/MusicianCard/MusicianCard';
import { useDiscoveryViewModel } from '../viewmodels/useDiscoveryViewModel';
import { FilterModal } from './FilterModal';
import { HistoryModal } from './HistoryModal';

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
    <SafeAreaView style={styles.container}>

      {/* ── Header ──────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.logo}>Legato</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search-outline" size={Spacing.iconLg} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={Spacing.iconLg} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={Spacing.iconLg} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Controles rápidos ────────────────────────── */}
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

      {/* ── Stack de cards ───────────────────────────── */}
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

      {/* ── Hint ─────────────────────────────────────── */}
      {cards.length > 0 && (
        <LegatoText variant="caption" color={Colors.textMuted} align="center" style={styles.hint}>
          Arraste o card para a esquerda para ignorar, ou para a direita para conversar
        </LegatoText>
      )}

      {/* ── Modais ───────────────────────────────────── */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.sm,
  },
  logo: {
    color: Colors.primaryDark,
    fontSize: Typography.FontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Controles
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

  // Card stack
  cardArea: {
    flex: 1,
    marginHorizontal: Spacing.screenPaddingH,
    marginBottom: Spacing.sm,
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

  // Hint
  hint: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingBottom: Spacing.md,
    textAlign: 'center',
  },
});
