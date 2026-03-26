/**
 * MusicianProfileScreen — View (perfil público)
 *
 * Responsabilidade exclusiva: renderizar o que o ViewModel expõe.
 * Sem estados locais, sem lógica de dados, sem cálculos de layout.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { Button } from '@/components/atoms/Button/Button';
import { Tag } from '@/components/atoms/Tag/Tag';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, BorderRadius, Shadows } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import { useMusicianProfileViewModel, type ProfileTab } from '../viewmodels/useMusicianProfileViewModel';

const fallbackCover = require('@/assets/images/BACKGROUND_SPLASH.png');

type MusicianProfileRoute = RouteProp<RootStackParamList, 'MusicianProfile'>;
type MusicianProfileNav = StackNavigationProp<RootStackParamList, 'MusicianProfile'>;

const TAB_PLACEHOLDER_TEXT: Record<Exclude<ProfileTab, 'overview'>, string> = {
  activity: 'Atividade recente aparecerá aqui quando o endpoint estiver disponível.',
  music: 'Músicas, lançamentos e prévias vão entrar nesta aba.',
  collaborations: 'Convites e colaborações públicas aparecerão aqui.',
};

export default function MusicianProfileScreen() {
  const route = useRoute<MusicianProfileRoute>();
  const navigation = useNavigation<MusicianProfileNav>();
  const { displayName, musicianId } = route.params;

  const {
    profile,
    isLoading,
    activeTab,
    tabs,
    isConnected,
    isFavoritesPanelOpen,
    visibleFavoriteArtists,
    setActiveTab,
    toggleConnection,
    openFavoritesPanel,
    closeFavoritesPanel,
  } = useMusicianProfileViewModel(musicianId);

  if (isLoading) return <Spinner fullScreen />;

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.fallbackHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-down" size={Spacing.iconXl} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.fallbackContent}>
          <LegatoText variant="subtitle" color={Colors.white} align="center">
            {displayName ?? 'Perfil do músico'}
          </LegatoText>
          <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
            Perfil indisponível no momento.
          </LegatoText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Hero (capa + avatar) ───────────────────────── */}
        <View style={styles.heroArea}>
          <ImageBackground
            source={
              profile.bannerUrl
                ? { uri: profile.bannerUrl }
                : profile.photos[0]
                ? { uri: profile.photos[0] }
                : fallbackCover
            }
            resizeMode="cover"
            style={styles.cover}
          >
            <View style={styles.coverOverlay} />
            <View style={styles.heroHeader}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                <Ionicons name="chevron-down" size={Spacing.iconXl} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="ellipsis-horizontal" size={Spacing.iconLg} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </ImageBackground>

          <View style={[styles.avatarFrame, Shadows.md]}>
            <Avatar uri={profile.avatarUrl} size="xl" fallbackInitials={profile.displayName} />
          </View>
        </View>

        <View style={styles.mainSection}>

          {/* ── Identidade ────────────────────────────────── */}
          <View style={styles.identityBlock}>
            <LegatoText variant="subtitle" color={Colors.white} align="center">
              {profile.displayName}
            </LegatoText>
            <LegatoText variant="bodySmall" color={Colors.primaryLight} align="center">
              @{profile.username}
            </LegatoText>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={Spacing.iconSm} color={Colors.textMuted} />
              <LegatoText variant="caption" color={Colors.textMuted}>
                {profile.location ?? 'Localização não informada'}
              </LegatoText>
            </View>
          </View>

          {/* ── Ações (conectar / mensagem) ────────────────── */}
          <View style={styles.actionsRow}>
            <Button
              label={isConnected ? 'Conectado' : 'Conectar'}
              variant={isConnected ? 'primary' : 'outline'}
              size="md"
              onPress={toggleConnection}
              leftIcon={
                <Ionicons
                  name={isConnected ? 'person' : 'person-add'}
                  size={Spacing.iconSm}
                  color={Colors.white}
                />
              }
              style={styles.connectButton}
            />
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={Spacing.iconMd} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* ── Stats ─────────────────────────────────────── */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <LegatoText variant="sectionTitle" color={Colors.white}>{profile.stats.connections}</LegatoText>
              <LegatoText variant="caption" color={Colors.textMuted}>CONEXÕES</LegatoText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <LegatoText variant="sectionTitle" color={Colors.white}>{profile.stats.followers}</LegatoText>
              <LegatoText variant="caption" color={Colors.textMuted}>SEGUIDORES</LegatoText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <LegatoText variant="sectionTitle" color={Colors.white}>{profile.stats.posts}</LegatoText>
              <LegatoText variant="caption" color={Colors.textMuted}>POSTS</LegatoText>
            </View>
          </View>

          {/* ── Abas ──────────────────────────────────────── */}
          <View style={styles.tabsRow}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              >
                <LegatoText
                  variant="label"
                  color={activeTab === tab.key ? Colors.primary : Colors.textMuted}
                >
                  {tab.label}
                </LegatoText>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Conteúdo da aba ───────────────────────────── */}
          {activeTab === 'overview' ? (
            <>
              {/* Bio + Objetivo */}
              <View style={styles.card}>
                <LegatoText variant="sectionTitle" color={Colors.white}>Bio</LegatoText>
                <LegatoText variant="bodySmall" color={Colors.textSecondaryDark}>
                  {profile.bio}
                </LegatoText>
                <LegatoText variant="label" color={Colors.white}>Objetivo</LegatoText>
                <View style={styles.goalBox}>
                  <Ionicons name="flag-outline" size={Spacing.iconSm} color={Colors.success} />
                  <LegatoText variant="bodySmall" color={Colors.textSecondaryDark} style={styles.goalText}>
                    {profile.objective}
                  </LegatoText>
                </View>
              </View>

              {/* Habilidades e gêneros */}
              <View style={styles.card}>
                <LegatoText variant="label" color={Colors.white}>HABILIDADES</LegatoText>
                <View style={styles.tagGrid}>
                  {profile.skills.map((skill) => (
                    <Tag key={skill} label={skill} />
                  ))}
                </View>
                <LegatoText variant="label" color={Colors.white}>GÊNEROS FAVORITOS</LegatoText>
                <View style={styles.tagGrid}>
                  {profile.musicGenres.map((genre) => (
                    <Tag key={genre} label={genre} variant="outline" color={Colors.primaryLight} />
                  ))}
                </View>
              </View>

              {/* Artistas favoritos */}
              <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                  <LegatoText variant="sectionTitle" color={Colors.white}>Artistas Favoritos</LegatoText>
                  <TouchableOpacity onPress={openFavoritesPanel}>
                    <LegatoText variant="caption" color={Colors.primary}>Ver tudo</LegatoText>
                  </TouchableOpacity>
                </View>
                <View style={styles.favoriteRow}>
                  {visibleFavoriteArtists.map((artist) => (
                    <View key={artist.id} style={styles.favoriteItem}>
                      <Avatar uri={artist.avatarUrl} size="md" fallbackInitials={artist.displayName} />
                      <LegatoText variant="caption" color={Colors.white} align="center" numberOfLines={1}>
                        {artist.displayName}
                      </LegatoText>
                      <LegatoText variant="caption" color={Colors.textMuted} align="center" numberOfLines={1}>
                        @{artist.username}
                      </LegatoText>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.card}>
              <LegatoText variant="bodySmall" color={Colors.textSecondaryDark} align="center">
                {TAB_PLACEHOLDER_TEXT[activeTab]}
              </LegatoText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Painel de todos os artistas favoritos ─────────── */}
      <Modal
        visible={isFavoritesPanelOpen}
        transparent
        animationType="fade"
        onRequestClose={closeFavoritesPanel}
      >
        <Pressable style={styles.panelBackdrop} onPress={closeFavoritesPanel}>
          <Pressable style={styles.panel} onPress={() => {}}>
            <View style={styles.panelHeader}>
              <LegatoText variant="sectionTitle" color={Colors.white}>Artistas Favoritos</LegatoText>
              <TouchableOpacity style={styles.panelCloseBtn} onPress={closeFavoritesPanel}>
                <Ionicons name="close" size={Spacing.iconMd} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelListContent}>
              {profile.favoriteArtists.map((artist) => (
                <View key={artist.id} style={styles.panelListItem}>
                  <Avatar uri={artist.avatarUrl} size="md" fallbackInitials={artist.displayName} />
                  <View style={styles.panelListTextBlock}>
                    <LegatoText variant="bodyMedium" color={Colors.white}>{artist.displayName}</LegatoText>
                    <LegatoText variant="caption" color={Colors.textMuted}>@{artist.username}</LegatoText>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  heroArea: {
    marginBottom: Spacing.lg,
  },
  cover: {
    height: Spacing.logoXxl,
    justifyContent: 'flex-start',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  iconBtn: {
    width: Spacing.buttonHeightSm,
    height: Spacing.buttonHeightSm,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.overlay,
  },
  avatarFrame: {
    alignSelf: 'center',
    marginTop: -Spacing.avatarLg,
    borderWidth: Spacing.xs,
    borderColor: Colors.surfaceDark,
    borderRadius: BorderRadius.pill,
  },
  mainSection: {
    paddingHorizontal: Spacing.screenPaddingH,
    gap: Spacing.md,
  },
  identityBlock: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  connectButton: {
    minWidth: Spacing.logoMd,
    borderRadius: BorderRadius.pill,
  },
  messageButton: {
    width: Spacing.buttonHeightMd,
    height: Spacing.buttonHeightMd,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: Spacing.xl,
    backgroundColor: Colors.border,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: Colors.transparent,
  },
  tabButtonActive: {
    borderBottomColor: Colors.primary,
  },
  card: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  goalText: {
    flex: 1,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  favoriteItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 0,
  },
  panelBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPaddingH,
  },
  panel: {
    maxHeight: '70%',
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelCloseBtn: {
    width: Spacing.buttonHeightSm,
    height: Spacing.buttonHeightSm,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundDark,
  },
  panelListContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  panelListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundDark,
  },
  panelListTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  fallbackHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  fallbackContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPaddingH,
  },
});
