import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ModalTemplate } from '@/components/templates/ModalTemplate/ModalTemplate';
import { Icon } from '@/components/atoms/Icon/Icon';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Spacing, BorderRadius } from '@/theme';
import type { AttachmentSheetProps } from './AttachmentSheet.types';

interface Option {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

export function AttachmentSheet({ visible, onClose, onPickMedia, onPickAudio }: AttachmentSheetProps) {
  const options: Option[] = [
    { icon: 'images-outline', label: 'Galeria', color: '#9B59B6', onPress: onPickMedia },
    { icon: 'musical-notes-outline', label: 'Áudio', color: '#E67E22', onPress: onPickAudio },
  ];

  return (
    <ModalTemplate visible={visible} onClose={onClose}>
      <View style={styles.grid}>
        {options.map((opt) => (
          <TouchableOpacity key={opt.label} style={styles.option} onPress={opt.onPress} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: opt.color }]}>
              <Icon variant="vector" name={opt.icon} family="Ionicons" size={28} color="#fff" />
            </View>
            <LegatoText variant="caption" style={styles.label}>{opt.label}</LegatoText>
          </TouchableOpacity>
        ))}
      </View>
    </ModalTemplate>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  option: {
    alignItems: 'center',
    width: 72,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    textAlign: 'center',
  },
});
