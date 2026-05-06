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
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { AppTemplate } from '@/components/templates/AppTemplate/AppTemplate';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { TabBar } from '@/components/molecules/TabBar/TabBar';
import { ProfileBanner } from '@/components/molecules/ProfileBanner/ProfileBanner';
import { TagSelectorModal } from '@/components/molecules/TagSelectorModal/TagSelectorModal';
import { TagSection } from '@/components/molecules/TagSection/TagSection';
import { SocialLinkInput } from '@/components/molecules/SocialLinkInput/SocialLinkInput';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Divider } from '@/components/atoms/Divider/Divider';
import { SelectField } from '@/components/molecules/SelectField/SelectField';
import { ModalTriggerField } from '@/components/molecules/ModalTriggerField/ModalTriggerField';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { SKILLS } from '@/constants/skills';
import { MUSIC_GENRES, getMusicGenreLabel } from '@/constants/genres';
import { useProfileEditViewModel } from '../viewmodels/useProfileEditViewModel';
import { BioObjectiveModal } from './BioObjectiveModal';

const MAX_PHOTOS = 4;
const PHOTO_SIZE = 72;

const SEX_OPTIONS = [
  { label: 'Masculino', value: 'MALE' },
  { label: 'Feminino', value: 'FEMALE' },
  { label: 'Outro', value: 'OTHER' },
  { label: 'Prefiro não dizer', value: 'PREFER_NOT_TO_SAY' },
];

export default function ProfileEditScreen() {
  const {
    form,
    handleSave,
    handleSkip,
    isLoading,
    isProfileLoading,
    errorMessage,
    isOnboarding,
    handleHeaderSettings,
    handleHeaderNotifications,
    displayName,
    avatarUri,
    bioValue,
    objectiveValue,
    tabs,
    activeTab,
    setActiveTab,
    showSkillsModal,
    openSkillsModal,
    closeSkillsModal,
    showGenresModal,
    openGenresModal,
    closeGenresModal,
    showBioObjectiveModal,
    openBioObjectiveModal,
    closeBioObjectiveModal,
    selectedSkills,
    selectedGenres,
    removeSkill,
    removeGenre,
    confirmSkills,
    confirmGenres,
    selectedSex,
    bannerUri,
    photos,
    handlePickAvatar,
    handlePickBanner,
    handlePickPhoto,
    removePhoto,
    scrollAreaHeight,
    onScrollAreaLayout,
  } = useProfileEditViewModel();

  const { control, formState: { errors } } = form;
  const colors = useColors();

  if (isProfileLoading) return <Spinner fullScreen />;

  return (
    <AppTemplate
      noPadding
      headerProps={{
        title: isOnboarding ? 'Configurar Perfil' : undefined,
        hideSearch: isOnboarding,
        hideNotifications: isOnboarding,
        hideSettings: isOnboarding,
        onSettingsPress: isOnboarding ? undefined : handleHeaderSettings,
        onNotificationsPress: isOnboarding ? undefined : handleHeaderNotifications,
      }}
    >

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
              bannerUri={bannerUri}
              displayName={displayName}
              editable
              onBannerPress={handlePickBanner}
              onAvatarPress={handlePickAvatar}
            />

            {/* ── Informações Básicas ─────────────────────────── */}
            <LegatoText variant="label" color={colors.textSecondary} style={styles.sectionLabelBasics}>
              INFORMAÇÕES BÁSICAS
            </LegatoText>

            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, value } }) => (
                <FormField label="Nome Artístico"
                  placeholder="Como você quer aparecer?"
                  value={value} onChangeText={onChange}
                  errorMessage={errors.displayName?.message} />
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <FormField label="Username"
                  placeholder="@seu_username" autoCapitalize="none"
                  value={value} onChangeText={onChange}
                  errorMessage={errors.username?.message} />
              )}
            />

            <Controller
              control={control}
              name="sex"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Gênero"
                  options={SEX_OPTIONS}
                  value={value}
                  onChange={onChange}
                  placeholder="Selecione seu gênero..."
                />
              )}
            />

            {/* Bio & Objetivo — abre modal ao tocar */}
            <ModalTriggerField
              label="Bio & Objetivo"
              value={bioValue || objectiveValue ? `${bioValue ?? ''}${objectiveValue ? ` · ${objectiveValue}` : ''}` : undefined}
              placeholder="Toque para adicionar sua bio..."
              onPress={openBioObjectiveModal}
            />

            <Divider marginV={Spacing.md} />

            {/* ── Localização ─────────────────────────────────── */}
            <LegatoText variant="label" color={colors.textSecondary} style={styles.sectionLabelOthers}>
              LOCALIZAÇÃO
            </LegatoText>

            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <FormField label="Cidade"
                  placeholder="Ex: São Paulo"
                  value={value ?? ''} onChangeText={onChange} />
              )}
            />

            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, value } }) => (
                <FormField label="Estado"
                  placeholder="Ex: SP"
                  value={value ?? ''} onChangeText={onChange} />
              )}
            />

            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <FormField label="País"
                  placeholder="Ex: Brasil"
                  value={value ?? ''} onChangeText={onChange} />
              )}
            />
            
            <Divider marginV={Spacing.md} />

            {/* ── Fotos do Perfil ─────────────────────────────── */}
            <LegatoText variant="label" color={colors.textSecondary} style={styles.sectionLabelOthers}>
              FOTOS DO PERFIL
            </LegatoText>

            <View style={styles.photoGrid}>
              {/* Slots de fotos existentes */}
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoSlot}>
                  <Image source={{ uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={[styles.photoRemove, { backgroundColor: colors.background }]}
                    onPress={() => removePhoto(index)}
                    hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Slot de adição — visível enquanto houver espaço */}
              {photos.length < MAX_PHOTOS && (
                <TouchableOpacity style={[styles.photoAdd, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handlePickPhoto} activeOpacity={0.7}>
                  <Ionicons name="add" size={28} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <Divider marginV={Spacing.md} />

            {/* ── Interesses Musicais ─────────────────────────── */}
            <LegatoText variant="label" color={colors.textSecondary} style={styles.sectionLabelOthers}>
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
              getItemLabel={getMusicGenreLabel}
            />

            

            <Divider marginV={Spacing.md} />

            {/* ── Links e Redes Sociais ───────────────────────── */}
            <LegatoText variant="label" color={colors.textSecondary} style={styles.sectionLabelOthers}>
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
        getItemLabel={getMusicGenreLabel}
      />
      <BioObjectiveModal
        visible={showBioObjectiveModal}
        onClose={closeBioObjectiveModal}
        control={control}
        errors={errors}
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

  // Grade de fotos
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  photoSlot: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: BorderRadius.md,
    overflow: 'visible',
  },
  photoImage: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: BorderRadius.md,
  },
  photoRemove: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: BorderRadius.pill,
  },
  photoAdd: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
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
