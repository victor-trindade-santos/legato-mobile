/**
 * NotificationsScreen — View (Notificações)
 * ══════════════════════════════════════════════════
 * CAMADA: View (MVVM) — Responsabilidade de ULISSES
 *
 * Responsabilidade desta camada:
 * - Conectar o ViewModel aos componentes visuais
 * - Definir o layout de tela (SafeAreaView, header)
 * - Delegar a renderização de listas ao Organism
 * - NÃO contém lógica de negócio nem chamadas de API
 *
 * ──────────────────────────────────────────────────
 * FLUXO DE DADOS (para referência):
 *
 *   API (Spring Boot)
 *     ↓
 *   notificationService.ts       ← Service
 *     ↓
 *   useNotificationsViewModel    ← ViewModel (TanStack Query + Zustand)
 *     ↓
 *   NotificationsScreen          ← View (este arquivo)
 *     ↓
 *   NotificationList             ← Organism
 *     ↓
 *   NotificationItem             ← Molecule
 *     ↓
 *   Avatar / LegatoText / Button ← Atoms
 *
 * ──────────────────────────────────────────────────
 * BADGE DA TAB BAR:
 * O badge de notificações NÃO é gerenciado aqui.
 * O useNotificationsViewModel atualiza o Zustand (notificationStore)
 * e o MainNavigator lê o unreadCount diretamente do store.
 *
 * ──────────────────────────────────────────────────
 * PARA CRIAR UMA NOVA FEATURE, SIGA ESTA ORDEM:
 *   1. models/   → interface TypeScript
 *   2. services/ → chamadas Axios
 *   3. viewmodels/ → TanStack Query + mutations + Zustand
 *   4. views/    → componentes visuais da feature (lista, card) + tela final
 *   6. Registrar rota em MainNavigator.tsx
 *   7. Adicionar tipo de rota em navigation/types.ts
 * ──────────────────────────────────────────────────
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationList } from './NotificationList';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { Colors, Spacing } from '@/theme';
import { useNotificationsViewModel } from '../viewmodels/useNotificationsViewModel';

export default function NotificationsScreen() {
  // ViewModel expõe dados e ações — a View não sabe como são obtidos
  const {
    notifications,
    isLoading,
    hasUnread,
    markAsRead,
    markAllAsRead,
  } = useNotificationsViewModel();

  // Estado de carregamento: Spinner fullscreen enquanto a query não resolve
  if (isLoading) return <Spinner fullScreen />;

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <LegatoText variant="subtitle" color={Colors.white}>
          Notificações
        </LegatoText>

        {/*
         * Botão "Marcar todas como lidas"
         * Só renderiza quando há notificações não lidas (hasUnread do ViewModel)
         */}
        {hasUnread && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={18} color={Colors.primary} />
            <LegatoText variant="caption" color={Colors.primary}> Marcar todas</LegatoText>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Lista ──────────────────────────────────────────── */}
      {/*
       * NotificationList é o Organism que sabe renderizar a lista.
       * A View apenas repassa os dados e callbacks recebidos do ViewModel.
       *
       * onAccept / onDecline: hoje apenas marcam como lida.
       * Futuramente: integrar com connectionService.accept(id) / .decline(id)
       */}
      <NotificationList
        notifications={notifications}
        onMarkRead={markAsRead}
        onAccept={(id) => markAsRead(id)}
        onDecline={(id) => markAsRead(id)}
      />

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
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
