/**
 * ProfileEditScreen — View (profile-edit)
 * Edição do próprio perfil: banner, informações básicas, skills,
 * gêneros musicais e links sociais.
 *
 * Serve como tela de onboarding (pós-cadastro) e como edição posterior.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/molecules/AppHeader/AppHeader';
import { TabBar } from '@/components/molecules/TabBar/TabBar';
import { ProfileBanner } from '@/components/molecules/ProfileBanner/ProfileBanner';
import { TagSelectorModal } from '@/components/molecules/TagSelectorModal/TagSelectorModal';
import { SocialLinkInput } from '@/components/molecules/SocialLinkInput/SocialLinkInput';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { Tag } from '@/components/atoms/Tag/Tag';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Divider } from '@/components/atoms/Divider/Divider';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { SKILLS } from '@/constants/skills';
import { MUSIC_GENRES } from '@/constants/genres';
import { useProfileEditViewModel } from '../viewmodels/useProfileEditViewModel';

const TABS = [
  { key: 'tudo', label: 'Tudo' },
  { key: 'card', label: 'Card' },
  { key: 'colaboracoes', label: 'Colaborações' },
];

export default function ProfileEditScreen() {
  const {
    form,
    handleSave,
    handleSkip,
    isLoading,
    errorMessage,
    isOnboarding,
    displayName,
    avatarUri,
  } = useProfileEditViewModel();

  const { control, watch, setValue, formState: { errors } } = form;
  const selectedSkills = watch('skills');
  const selectedGenres = watch('musicGenres');

  const [activeTab, setActiveTab] = useState('tudo');
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showGenresModal, setShowGenresModal] = useState(false);

  return (
    <SafeAreaView style={styles.root}>
      <AppHeader
        hideSearch={false}
        hideNotifications={false}
        hideSettings={false}
      />

      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'tudo' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Banner + Avatar */}
          <ProfileBanner
            avatarUri={avatarUri}
            displayName={displayName}
            editable
            onBannerPress={() => {/* upload banner — futuro */}}
            onAvatarPress={() => {/* upload avatar — futuro */}}
          />

          {/* ── Informações Básicas ─────────────────────────── */}
          <LegatoText variant="label" color={Colors.textSecondaryDark} style={styles.sectionLabel}>
            INFORMAÇÕES BÁSICAS
          </LegatoText>

          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, value } }) => (
              <FormField
                variant="dark"
                label="Nome Artístico"
                placeholder="Como você quer aparecer?"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.displayName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <FormField
                variant="dark"
                label="Username"
                placeholder="@seu_username"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.username?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <FormField
                variant="dark"
                label="Bio"
                placeholder="Fale sobre sua trajetória musical..."
                value={value}
                onChangeText={onChange}
                errorMessage={errors.bio?.message}
                multiline
                numberOfLines={4}
              />
            )}
          />

          <Divider marginV={Spacing.md} color={Colors.border} />

          {/* ── Interesses Musicais ─────────────────────────── */}
          <LegatoText variant="label" color={Colors.textSecondaryDark} style={styles.sectionLabel}>
            INTERESSES MUSICAIS
          </LegatoText>

          {/* Skills */}
          <View style={styles.tagSection}>
            <View style={styles.tagSectionHeader}>
              <LegatoText variant="bodySmall" color={Colors.white}>Habilidades</LegatoText>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowSkillsModal(true)}
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
                <LegatoText variant="caption" color={Colors.primary}>Add</LegatoText>
              </TouchableOpacity>
            </View>
            {selectedSkills.length > 0 ? (
              <View style={styles.tagRow}>
                {selectedSkills.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    onPress={() =>
                      setValue('skills', selectedSkills.filter((s) => s !== skill))
                    }
                  >
                    <Tag label={skill} variant="filled" color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <LegatoText variant="caption" color={Colors.textMuted}>
                Nenhuma habilidade selecionada
              </LegatoText>
            )}
          </View>

          {/* Gêneros */}
          <View style={styles.tagSection}>
            <View style={styles.tagSectionHeader}>
              <LegatoText variant="bodySmall" color={Colors.white}>Gêneros Musicais</LegatoText>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowGenresModal(true)}
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
                <LegatoText variant="caption" color={Colors.primary}>Add</LegatoText>
              </TouchableOpacity>
            </View>
            {selectedGenres.length > 0 ? (
              <View style={styles.tagRow}>
                {selectedGenres.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    onPress={() =>
                      setValue('musicGenres', selectedGenres.filter((g) => g !== genre))
                    }
                  >
                    <Tag label={genre} variant="outline" color={Colors.primaryLight} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <LegatoText variant="caption" color={Colors.textMuted}>
                Nenhum gênero selecionado
              </LegatoText>
            )}
          </View>

          <Divider marginV={Spacing.md} color={Colors.border} />

          {/* ── Links e Redes Sociais ───────────────────────── */}
          <LegatoText variant="label" color={Colors.textSecondaryDark} style={styles.sectionLabel}>
            LINKS E REDES SOCIAIS
          </LegatoText>

          <Controller control={control} name="instagram" render={({ field: { onChange, value } }) => (
            <SocialLinkInput iconName="logo-instagram" iconColor="#E1306C"
              platform="Instagram" placeholder="instagram.com/seu-perfil"
              value={value ?? ''} onChangeText={onChange} />
          )} />

          <Controller control={control} name="spotify" render={({ field: { onChange, value } }) => (
            <SocialLinkInput iconName="logo-spotify" iconColor="#1DB954"
              platform="Spotify" placeholder="open.spotify.com/artist/..."
              value={value ?? ''} onChangeText={onChange} />
          )} />

          <Controller control={control} name="youtube" render={({ field: { onChange, value } }) => (
            <SocialLinkInput iconName="logo-youtube" iconColor="#FF0000"
              platform="YouTube" placeholder="youtube.com/@seu-canal"
              value={value ?? ''} onChangeText={onChange} />
          )} />

          <Controller control={control} name="soundcloud" render={({ field: { onChange, value } }) => (
            <SocialLinkInput iconName="logo-soundcloud" iconColor="#FF5500"
              platform="SoundCloud" placeholder="soundcloud.com/seu-perfil"
              value={value ?? ''} onChangeText={onChange} />
          )} />

          <Controller control={control} name="website" render={({ field: { onChange, value } }) => (
            <SocialLinkInput iconName="globe-outline" iconColor={Colors.primaryLight}
              platform="Site Pessoal" placeholder="seusite.com"
              value={value ?? ''} onChangeText={onChange} />
          )} />

          {errorMessage && (
            <LegatoText variant="caption" color={Colors.error} style={styles.globalError}>
              {errorMessage}
            </LegatoText>
          )}

          <Button
            label="Salvar Alterações"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isLoading}
            onPress={handleSave}
            style={styles.saveBtn}
          />

          {isOnboarding && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <LegatoText variant="caption" color={Colors.textMuted} align="center">
                Preencher depois
              </LegatoText>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        /* ── Stubs das outras abas ─────────────────────────── */
        <View style={styles.stubContainer}>
          <Ionicons
            name={activeTab === 'card' ? 'card-outline' : 'musical-notes-outline'}
            size={48}
            color={Colors.textMuted}
          />
          <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
            {activeTab === 'card'
              ? 'Personalização do card de Discovery\nem breve.'
              : 'Histórico de colaborações\nem breve.'}
          </LegatoText>
        </View>
      )}

      {/* Modais de seleção de tags */}
      <TagSelectorModal
        visible={showSkillsModal}
        title="Habilidades"
        items={SKILLS}
        selected={selectedSkills}
        onConfirm={(items) => setValue('skills', items, { shouldValidate: true })}
        onClose={() => setShowSkillsModal(false)}
      />

      <TagSelectorModal
        visible={showGenresModal}
        title="Gêneros Musicais"
        items={MUSIC_GENRES}
        selected={selectedGenres}
        onConfirm={(items) => setValue('musicGenres', items, { shouldValidate: true })}
        onClose={() => setShowGenresModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingBottom: Spacing.xxxl,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
    letterSpacing: 0.8,
  },
  tagSection: {
    marginBottom: Spacing.md,
  },
  tagSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  globalError: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  saveBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  skipBtn: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  stubContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screenPaddingH,
  },
});
