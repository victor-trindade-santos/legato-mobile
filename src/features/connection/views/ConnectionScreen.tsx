/**
 * ConnectionScreen — View (Conexão) — ULISSES
 * Lista de conexões aceitas e pedidos pendentes.
 */

import React, { useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { Button } from '@/components/atoms/Button/Button';
import { Tag } from '@/components/atoms/Tag/Tag';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { Divider } from '@/components/atoms/Divider/Divider';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useConnectionViewModel } from '../viewmodels/useConnectionViewModel';
import type { Connection } from '../models/Connection';

type Tab = 'connections' | 'pending';

export default function ConnectionScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('connections');
  const { connections, pendingConnections, isLoading, acceptConnection, declineConnection } = useConnectionViewModel();

  if (isLoading) return <Spinner fullScreen />;

  const data: Connection[] = activeTab === 'connections' ? connections : pendingConnections;

  const renderItem = ({ item }: { item: Connection }) => (
    <View style={styles.item}>
      <Avatar uri={item.user.avatarUrl} size="md" fallbackInitials={item.user.displayName} />
      <View style={styles.itemContent}>
        <LegatoText variant="bodyMedium" color={Colors.white}>{item.user.displayName}</LegatoText>
        <LegatoText variant="caption" color={Colors.textMuted}>@{item.user.username}</LegatoText>
        <View style={styles.tags}>
          {item.user.skills.slice(0, 2).map(s => <Tag key={s} label={s} />)}
        </View>
        {activeTab === 'pending' && (
          <View style={styles.actions}>
            <Button label="Aceitar" variant="primary" size="sm" onPress={() => acceptConnection(item.id)} style={styles.actionBtn} />
            <Button label="Recusar" variant="outline" size="sm" onPress={() => declineConnection(item.id)} style={styles.actionBtn} />
          </View>
        )}
      </View>
      {activeTab === 'connections' && (
        <TouchableOpacity style={styles.chatBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LegatoText variant="subtitle" color={Colors.white}>Conexões</LegatoText>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'connections' && styles.tabActive]}
          onPress={() => setActiveTab('connections')}
        >
          <LegatoText variant="label" color={activeTab === 'connections' ? Colors.primary : Colors.textMuted}>
            Conectados ({connections.length})
          </LegatoText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <LegatoText variant="label" color={activeTab === 'pending' ? Colors.primary : Colors.textMuted}>
            Pendentes ({pendingConnections.length})
          </LegatoText>
        </TouchableOpacity>
      </View>

      <Divider />

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
            <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
              {activeTab === 'connections' ? 'Nenhuma conexão ainda' : 'Nenhum pedido pendente'}
            </LegatoText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: { paddingHorizontal: Spacing.screenPaddingH, paddingVertical: Spacing.md },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.screenPaddingH },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  list: { padding: Spacing.screenPaddingH, gap: Spacing.md },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.surfaceDark, borderRadius: BorderRadius.lg, padding: Spacing.md,
  },
  itemContent: { flex: 1, gap: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn: { flex: 1 },
  chatBtn: { padding: Spacing.xs },
  empty: { alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.xxl },
});
