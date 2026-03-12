/**
 * MusicianProfileScreen — PLACEHOLDER
 * TODO: Implementar por Felipe Selva Rocha Alves
 *
 * Exibido como modal ao arrastar um card para baixo na tela de Descoberta.
 * Deve mostrar o perfil completo do músico (bio, fotos, skills, redes sociais, etc.).
 * Referência: frontend/src/app/(main)/users/[username]/page.tsx
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

type MusicianProfileRoute = RouteProp<RootStackParamList, 'MusicianProfile'>;
type MusicianProfileNav = StackNavigationProp<RootStackParamList, 'MusicianProfile'>;

export default function MusicianProfileScreen() {
  const route = useRoute<MusicianProfileRoute>();
  const navigation = useNavigation<MusicianProfileNav>();
  const { displayName } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={28} color={Colors.white} />
        </TouchableOpacity>
        <LegatoText variant="subtitle" color={Colors.white}>{displayName}</LegatoText>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.content}>
        <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
          Perfil do músico — Em desenvolvimento (Felipe)
        </LegatoText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: { width: 40, alignItems: 'center' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
});
