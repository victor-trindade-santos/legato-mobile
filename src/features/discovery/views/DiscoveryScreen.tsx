/**
 * DiscoveryScreen — View (Descoberta)
 *
 * Layout via AppTemplate (noPadding=true — cards são full-bleed).
 * Card centralizado verticalmente com margens superior e inferior.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/types';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { Button } from '@/components/atoms/Button/Button';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { LegatoText } from '@/components/atoms/Text/Text';
import { MusicianCard } from '@/components/molecules/MusicianCard/MusicianCard';
import { Colors, Spacing, BorderRadius, Layout } from '@/theme';
import { useDiscoveryViewModel } from '../viewmodels/useDiscoveryViewModel';
import { FilterModal } from './FilterModal';
import { HistoryModal } from './HistoryModal';

// Altura e estilo do card vindas do tema — responsivo por dispositivo
const CARD_HEIGHT = Layout.cardHeight;
// Phone: ocupa a largura total menos as margens laterais (alignSelf: stretch)
// Tablet: largura fixa centralizada (alignSelf: center + width explícita)
const CARD_AREA_STYLE = Layout.isTablet
  ? { height: CARD_HEIGHT, width: Layout.cardMaxWidth, alignSelf: 'center' as const }
  : { height: CARD_HEIGHT, marginHorizontal: Spacing.screenPaddingH };

type DiscoveryNav = StackNavigationProp<RootStackParamList>;

export default function DiscoveryScreen() {
  const navigation = useNavigation<DiscoveryNav>();
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
        <Button
          label="Filtrar"
          variant="primary"
          size="sm"
          style={styles.controlBtn}
          leftIcon={<Ionicons name="options-outline" size={14} color={Colors.white} />}
          onPress={() => setIsFilterModalOpen(true)}
        />
        <Button
          label="Histórico"
          variant="primary"
          size="sm"
          style={styles.controlBtn}
          leftIcon={<Ionicons name="time-outline" size={14} color={Colors.white} />}
          onPress={() => setIsHistoryModalOpen(true)}
        />
      </View>

      {/* ── Área central (centraliza o card verticalmente) ── */}
      <View style={styles.centerArea}>

        {/* Stack de cards */}
        <View style={[styles.cardArea, CARD_AREA_STYLE]}>
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
                  onSwipeDown={index === 2 ? () => navigation.navigate('MusicianProfile', {
                    musicianId: musician.id,
                    displayName: musician.displayName,
                  }) : undefined}
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
    borderRadius: BorderRadius.pill,
  },

  // Container que centraliza verticalmente
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },

  cardArea: {
    // Dimensões aplicadas via CARD_AREA_STYLE (calculado em tempo de módulo)
    // para evitar conflito width:'100%' + marginHorizontal no RN
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
