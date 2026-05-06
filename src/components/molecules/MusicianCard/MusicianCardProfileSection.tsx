/**
 * MusicianCardProfileSection — Seção de perfil compactada dentro do card
 *
 * Renderiza informações do perfil em layout vertical compactado:
 * - Nome + @username
 * - Conexões + Seguidores
 * - Bio
 * - Habilidades + Gêneros Favoritos
 * - Artistas Favoritos (amostra)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Tag } from '@/components/atoms/Tag/Tag';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { getMusicGenreLabel } from '@/constants/genres';
import { useColors } from '@/hooks/useColors';
import type { MusicianCardData } from './MusicianCard.types';

interface MusicianCardProfileSectionProps {
  musician: MusicianCardData;
  profile?: {
    username: string;
    bio: string;
    objective: string;
    skills: string[];
    musicGenres: string[];
    stats: {
      connections: number;
      followers: number;
      posts: number;
    };
    favoriteArtists: Array<{
      id: number;
      displayName: string;
      username: string;
      avatarUrl?: string;
    }>;
  };
}

export function MusicianCardProfileSection({
  musician,
  profile,
}: MusicianCardProfileSectionProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* ── Identidade ────────────────────────────────── */}
      <View style={styles.identitySection}>
        <LegatoText variant="bodyMedium" color={colors.textPrimary} align="center">
          {musician.displayName}
        </LegatoText>
        <LegatoText variant="caption" color={Colors.primary} align="center">
          @{musician.username || 'usuario'}
        </LegatoText>
      </View>

      {/* ── Stats ─────────────────────────────────────── */}
      {profile?.stats && (
        <View style={[styles.statsCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <LegatoText variant="bodyMedium" color={colors.textPrimary}>
              {profile.stats.connections}
            </LegatoText>
            <LegatoText variant="caption" color={colors.textMuted}>
              CONEXÕES
            </LegatoText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <LegatoText variant="bodyMedium" color={colors.textPrimary}>
              {profile.stats.followers}
            </LegatoText>
            <LegatoText variant="caption" color={colors.textMuted}>
              SEGUIDORES
            </LegatoText>
          </View>
        </View>
      )}

      {/* ── Bio ───────────────────────────────────────── */}
      {profile?.bio && (
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <LegatoText variant="label" color={colors.textPrimary}>
            Bio
          </LegatoText>
          <LegatoText variant="caption" color={colors.textSecondary}>
            {profile.bio}
          </LegatoText>
        </View>
      )}

      {/* ── Habilidades + Gêneros ─────────────────────– */}
      {(profile?.skills?.length || 0) > 0 || (profile?.musicGenres?.length || 0) > 0 ? (
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {profile?.skills && profile.skills.length > 0 && (
            <>
              <LegatoText variant="label" color={colors.textPrimary}>
                HABILIDADES
              </LegatoText>
              <View style={styles.tagGrid}>
                {profile.skills.slice(0, 5).map((skill) => (
                  <Tag key={skill} label={skill} size="sm" />
                ))}
              </View>
            </>
          )}

          {profile?.musicGenres && profile.musicGenres.length > 0 && (
            <>
              <LegatoText
                variant="label"
                color={colors.textPrimary}
                style={{ marginTop: Spacing.md }}
              >
                GÊNEROS FAVORITOS
              </LegatoText>
              <View style={styles.tagGrid}>
                {profile.musicGenres.slice(0, 5).map((genre) => (
                  <Tag
                    key={genre}
                    label={getMusicGenreLabel(genre)}
                    variant="outline"
                    color={Colors.primaryLight}
                    size="sm"
                  />
                ))}
              </View>
            </>
          )}
        </View>
      ) : null}

      {/* ── Artistas Favoritos ────────────────────────– */}
      {profile?.favoriteArtists && profile.favoriteArtists.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <LegatoText variant="label" color={colors.textPrimary}>
            Artistas Favoritos
          </LegatoText>
          <View style={styles.artistsRow}>
            {profile.favoriteArtists.slice(0, 4).map((artist) => (
              <View key={artist.id} style={styles.artistItem}>
                <Avatar
                  uri={artist.avatarUrl}
                  size="md"
                  fallbackInitials={artist.displayName}
                />
                <LegatoText
                  variant="caption"
                  color={colors.textPrimary}
                  align="center"
                  numberOfLines={1}
                  style={{ marginTop: Spacing.xs }}
                >
                  {artist.displayName}
                </LegatoText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Padding inferior para acomodar scroll */}
      <View style={{ height: Spacing.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },

  identitySection: {
    gap: Spacing.xxs,
    paddingVertical: Spacing.sm,
  },

  statsCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
  },

  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },

  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },

  artistsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
  },
  artistItem: {
    alignItems: 'center',
    maxWidth: 60,
  },
});
