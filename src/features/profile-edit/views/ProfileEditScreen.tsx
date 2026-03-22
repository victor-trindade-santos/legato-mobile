/**
 * ProfileEditScreen — View (profile-edit)
 * Responsabilidade exclusiva: renderizar o que o ViewModel expõe.
 * Sem estados locais, sem lógica de dados.
 *
 * Estrutura: AppTemplate (noPadding) → TabBar → ScrollView | stub
 * AppTemplate já cuida de SafeAreaView + AppHeader.
 * AppTemplate.content usa minHeight:0 + overflow:hidden — sem isso o browser
 * aplica min-height:auto em flex children e o ScrollView nunca scrolla no web.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { TabBar } from '@/components/molecules/TabBar/TabBar';
import { ProfileBanner } from '@/components/molecules/ProfileBanner/ProfileBanner';
import { TagSelectorModal } from '@/components/molecules/TagSelectorModal/TagSelectorModal';
import { TagSection } from '@/components/molecules/TagSection/TagSection';
import { SocialLinkInput } from '@/components/molecules/SocialLinkInput/SocialLinkInput';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Divider } from '@/components/atoms/Divider/Divider';
import { Colors, Spacing } from '@/theme';
import { SKILLS } from '@/constants/skills';
import { MUSIC_GENRES } from '@/constants/genres';
import { useProfileEditViewModel } from '../viewmodels/useProfileEditViewModel';

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
    tabs,
    activeTab,
    setActiveTab,
    showSkillsModal,
    openSkillsModal,
    closeSkillsModal,
    showGenresModal,
    openGenresModal,
    closeGenresModal,
    selectedSkills,
    selectedGenres,
    removeSkill,
    removeGenre,
    confirmSkills,
    confirmGenres,
    scrollAreaHeight,
    onScrollAreaLayout,
  } = useProfileEditViewModel();

  const { control, formState: { errors } } = form;

  return (
    <AppTemplate noPadding>

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <View style={styles.scrollArea} onLayout={onScrollAreaLayout}>
        {activeTab === 'tudo' ? (
          <ScrollView
            style={{ height: scrollAreaHeight }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ProfileBanner
              avatarUri={avatarUri}
              displayName={displayName}
              editable
              onBannerPress={() => {}}
              onAvatarPress={() => {}}
            />

            {/* ── Informações Básicas ─────────────────────────── */}
            <LegatoText variant="label" color={Colors.textSecondaryDark} style={styles.sectionLabelBasics}>
              INFORMAÇÕES BÁSICAS
            </LegatoText>

            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, value } }) => (
                <FormField variant="dark" label="Nome Artístico"
                  placeholder="Como você quer aparecer?"
                  value={value} onChangeText={onChange}
                  errorMessage={errors.displayName?.message} />
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <FormField variant="dark" label="Username"
                  placeholder="@seu_username" autoCapitalize="none"
                  value={value} onChangeText={onChange}
                  errorMessage={errors.username?.message} />
              )}
            />

            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, value } }) => (
                <FormField variant="dark" label="Bio"
                  placeholder="Fale sobre sua trajetória musical..."
                  value={value} onChangeText={onChange}
                  errorMessage={errors.bio?.message}
                  multiline numberOfLines={4} />
              )}
            />

            <Divider marginV={Spacing.md} color={Colors.border} />

            {/* ── Interesses Musicais ─────────────────────────── */}
            <LegatoText variant="label" color={Colors.textSecondaryDark} style={styles.sectionLabelOthers}>
              INTERESSES MUSICAIS
            </LegatoText>

            <TagSection
              label="Habilidades"
              selected={selectedSkills}
              onRemove={removeSkill}
              onAdd={openSkillsModal}
              tagVariant="filled"
              tagColor={Colors.primary}
              emptyMessage="Nenhuma habilidade selecionada"
            />

            <TagSection
              label="Gêneros Musicais"
              selected={selectedGenres}
              onRemove={removeGenre}
              onAdd={openGenresModal}
              tagVariant="outline"
              tagColor={Colors.primaryLight}
              emptyMessage="Nenhum gênero selecionado"
            />

            <Divider marginV={Spacing.md} color={Colors.border} />

            {/* ── Links e Redes Sociais ───────────────────────── */}
            <LegatoText variant="label" color={Colors.textSecondaryDark} style={styles.sectionLabelOthers}>
              LINKS E REDES SOCIAIS
            </LegatoText>

            <Controller control={control} name="instagram" render={({ field: { onChange, value } }) => (
              <SocialLinkInput iconName="logo-instagram" iconColor="#E1306C"
                platform="Instagram" placeholder="instagram.com/seu-perfil"
                value={value ?? ''} onChangeText={onChange} />
            )} />

            <Controller control={control} name="spotify" render={({ field: { onChange, value } }) => (
              <SocialLinkInput iconName="musical-notes-outline" iconColor="#1DB954"
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

            <Button label="Salvar Alterações" variant="primary" size="md" fullWidth
              isLoading={isLoading} onPress={handleSave} style={styles.saveBtn} />

            {isOnboarding && (
              <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                <LegatoText variant="caption" color={Colors.textMuted} align="center">
                  Preencher depois
                </LegatoText>
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : (
          <View style={styles.stubContainer}>
            <Ionicons
              name={activeTab === 'card' ? 'card-outline' : 'musical-notes-outline'}
              size={48} color={Colors.textMuted}
            />
            <LegatoText variant="bodySmall" color={Colors.textMuted} align="center">
              {activeTab === 'card'
                ? 'Personalização do card de Discovery\nem breve.'
                : 'Histórico de colaborações\nem breve.'}
            </LegatoText>
          </View>
        )}
      </View>

      <TagSelectorModal
        visible={showSkillsModal} title="Habilidades"
        items={SKILLS} selected={selectedSkills}
        onConfirm={confirmSkills} onClose={closeSkillsModal}
      />
      <TagSelectorModal
        visible={showGenresModal} title="Gêneros Musicais"
        items={MUSIC_GENRES} selected={selectedGenres}
        onConfirm={confirmGenres} onClose={closeGenresModal}
      />
    </AppTemplate>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPaddingH,
    paddingBottom: Spacing.xxxl,
  },
  sectionLabelBasics: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xxl,
    letterSpacing: 0.8,
  },
  sectionLabelOthers: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    letterSpacing: 0.8,
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
