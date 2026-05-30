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
import { useAuthStore } from '@/store/authStore';
import { getMusicGenreLabel } from '@/constants/genres';
import { useColors } from '@/hooks/useColors';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
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
  const { user } = useAuthStore();
  const colors = useColors();
  const musicianId = route.params?.musicianId ?? user?.id ?? 0;
  const username = route.params?.username ?? user?.username;
  const displayName = route.params?.displayName ?? user?.displayName ?? '';
  const isOwnProfile = !route.params?.musicianId || musicianId === user?.id;
  const artistsSectionTitle = isOwnProfile ? 'Top artistas do Spotify' : 'Artistas Favoritos';

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
  } = useMusicianProfileViewModel(musicianId, username);

  if (isLoading) return <Spinner fullScreen />;

  if (!profile) {
    return (
      <AppTemplate showHeader={false} noPadding>
        {!isOwnProfile && (
          <View style={styles.fallbackHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="chevron-down" size={Spacing.iconXl} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.fallbackContent}>
          <LegatoText variant="subtitle" color={colors.textPrimary} align="center">
            {displayName ?? 'Perfil do músico'}
          </LegatoText>
          <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
            Perfil indisponível no momento.
          </LegatoText>
        </View>
      </AppTemplate>
    );
  }

  return (
    <AppTemplate showHeader={isOwnProfile} noPadding>
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
          </ImageBackground>

          <View style={[styles.avatarFrame, Shadows.md, { borderColor: colors.background }]}>
            <Avatar uri={profile.avatarUrl} size="xl" fallbackInitials={profile.displayName} />
          </View>
        </View>

        <View style={styles.mainSection}>

          {/* ── Identidade ────────────────────────────────── */}
          <View style={styles.identityBlock}>
            <LegatoText variant="subtitle" color={colors.textPrimary} align="center">
              {profile.displayName}
            </LegatoText>
            <LegatoText variant="bodySmall" color={Colors.primary} align="center">
              @{profile.username}
            </LegatoText>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={Spacing.iconSm} color={Colors.textMuted} />
              <LegatoText variant="caption" color={Colors.textMuted}>
                {profile.location ?? 'Localização não informada'}
              </LegatoText>
            </View>
          </View>

          {/* ── Ações ─────────────────────────────────────── */}
          <View style={styles.actionsRow}>
            {isOwnProfile ? (
              <Button
                label="Editar Perfil"
                variant="outline"
                size="md"
                onPress={() => navigation.navigate('ProfileEdit')}
                leftIcon={
                  <Ionicons name="pencil-outline" size={Spacing.iconSm} color={colors.textPrimary} />
                }
                style={styles.connectButton}
              />
            ) : (
              <>
                <Button
                  label={isConnected ? 'Conectado' : 'Conectar'}
                  variant={isConnected ? 'primary' : 'outline'}
                  size="md"
                  onPress={toggleConnection}
                  leftIcon={
                    <Ionicons
                      name={isConnected ? 'person' : 'person-add'}
                      size={Spacing.iconSm}
                      color={isConnected ? Colors.white : colors.textPrimary}
                    />
                  }
                  style={styles.connectButton}
                />
                <TouchableOpacity style={[styles.messageButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="chatbubble-outline" size={Spacing.iconMd} color={colors.textPrimary} />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ── Stats ─────────────────────────────────────── */}
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <LegatoText variant="sectionTitle" color={colors.textPrimary}>{profile.stats.connections}</LegatoText>
              <LegatoText variant="caption" color={colors.textMuted}>CONEXÕES</LegatoText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <LegatoText variant="sectionTitle" color={colors.textPrimary}>{profile.stats.followers}</LegatoText>
              <LegatoText variant="caption" color={colors.textMuted}>SEGUIDORES</LegatoText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <LegatoText variant="sectionTitle" color={colors.textPrimary}>{profile.stats.posts}</LegatoText>
              <LegatoText variant="caption" color={colors.textMuted}>POSTS</LegatoText>
            </View>
          </View>

          {/* ── Abas ──────────────────────────────────────── */}
          <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              >
                <LegatoText
                  variant="label"
                  color={activeTab === tab.key ? Colors.primary : colors.textMuted}
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
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <LegatoText variant="sectionTitle" color={colors.textPrimary}>Bio</LegatoText>
                <LegatoText variant="bodySmall" color={colors.textSecondary}>
                  {profile.bio}
                </LegatoText>
                <LegatoText variant="label" color={colors.textPrimary}>Objetivo</LegatoText>
                <View style={[styles.goalBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="flag-outline" size={Spacing.iconSm} color={Colors.success} />
                  <LegatoText variant="bodySmall" color={colors.textSecondary} style={styles.goalText}>
                    {profile.objective}
                  </LegatoText>
                </View>
              </View>

              {/* Habilidades e gêneros */}
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <LegatoText variant="label" color={colors.textPrimary}>HABILIDADES</LegatoText>
                <View style={styles.tagGrid}>
                  {profile.skills.map((skill) => (
                    <Tag key={skill} label={skill} />
                  ))}
                </View>
                <LegatoText variant="label" color={colors.textPrimary}>GÊNEROS FAVORITOS</LegatoText>
                <View style={styles.tagGrid}>
                  {profile.musicGenres.map((genre) => (
                    <Tag key={genre} label={getMusicGenreLabel(genre)} variant="outline" color={Colors.primaryLight} />
                  ))}
                </View>
              </View>

              {/* Artistas favoritos */}
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.sectionHeaderRow}>
                  <LegatoText variant="sectionTitle" color={colors.textPrimary}>{artistsSectionTitle}</LegatoText>
                  <TouchableOpacity onPress={openFavoritesPanel}>
                    <LegatoText variant="caption" color={Colors.primary}>Ver tudo</LegatoText>
                  </TouchableOpacity>
                </View>
                <View style={styles.favoriteRow}>
                  {visibleFavoriteArtists.map((artist) => (
                    <View key={artist.id} style={styles.favoriteItem}>
                      <Avatar uri={artist.avatarUrl} size="md" fallbackInitials={artist.displayName} />
                      <LegatoText variant="caption" color={colors.textPrimary} align="center" numberOfLines={1}>
                        {artist.displayName}
                      </LegatoText>
                      <LegatoText variant="caption" color={colors.textMuted} align="center" numberOfLines={1}>
                        @{artist.username}
                      </LegatoText>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <LegatoText variant="bodySmall" color={colors.textSecondary} align="center">
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
          <Pressable style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => {}}>
            <View style={styles.panelHeader}>
              <LegatoText variant="sectionTitle" color={colors.textPrimary}>{artistsSectionTitle}</LegatoText>
              <TouchableOpacity style={[styles.panelCloseBtn, { backgroundColor: colors.background }]} onPress={closeFavoritesPanel}>
                <Ionicons name="close" size={Spacing.iconMd} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelListContent}>
              {profile.favoriteArtists.map((artist) => (
                <View key={artist.id} style={[styles.panelListItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Avatar uri={artist.avatarUrl} size="md" fallbackInitials={artist.displayName} />
                  <View style={styles.panelListTextBlock}>
                    <LegatoText variant="bodyMedium" color={colors.textPrimary}>{artist.displayName}</LegatoText>
                    <LegatoText variant="caption" color={colors.textMuted}>@{artist.username}</LegatoText>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </AppTemplate>
  );
}

const styles = StyleSheet.create({
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
    borderWidth: 1,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: Spacing.xl,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    gap: Spacing.sm,
    borderWidth: 1,
  },
  goalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    borderWidth: 1,
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
    borderWidth: 1,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
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
