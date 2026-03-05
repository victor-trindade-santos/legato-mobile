/**
 * DiscoveryScreen — View (Descoberta) — ULISSES
 *
 * Tela principal de descoberta de músicos com swipe de cards.
 * Toda a lógica está em useDiscoveryViewModel.
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { Colors, Spacing } from '@/theme';
import { useDiscoveryViewModel } from '../viewmodels/useDiscoveryViewModel';
import { MusicianCard } from '@/components/molecules/MusicianCard/MusicianCard';

// TODO: substituir pelos organismos DiscoveryStack e FilterModal quando implementados
export default function DiscoveryScreen() {
  const {
    cards,
    history,
    isLoading,
    isFilterModalOpen,
    handleSwipe,
    handleUndo,
    setIsFilterModalOpen,
  } = useDiscoveryViewModel();

  if (isLoading) return <Spinner fullScreen />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <LegatoText variant="subtitle" color={Colors.white}>Encontrar Músicos</LegatoText>
          <LegatoText variant="caption" color={Colors.textSecondaryDark}>
            Procure músicos próximos a você!
          </LegatoText>
        </View>
        <View style={styles.headerActions}>
          {/* Desfazer */}
          {history.length > 0 && (
            <TouchableOpacity style={styles.iconBtn} onPress={handleUndo}>
              <Ionicons name="arrow-undo" size={Spacing.iconLg} color={Colors.primary} />
            </TouchableOpacity>
          )}
          {/* Filtros */}
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsFilterModalOpen(true)}>
            <Ionicons name="options" size={Spacing.iconLg} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

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
          // Renderiza apenas o card do topo (o resto fica atrás)
          cards.slice(0, 3).reverse().map((musician, index) => (
            <View
              key={musician.id}
              style={[
                styles.cardWrapper,
                { zIndex: index, transform: [{ scale: 1 - (2 - index) * 0.03 }] },
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

      {/* Instrução */}
      {cards.length > 0 && (
        <LegatoText variant="caption" color={Colors.textMuted} align="center" style={styles.hint}>
          Arraste para a esquerda para ignorar, direita para conectar
        </LegatoText>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
    paddingVertical: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArea: {
    flex: 1,
    marginHorizontal: Spacing.screenPaddingH,
    marginVertical: Spacing.md,
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  hint: {
    paddingBottom: Spacing.lg,
  },
});
