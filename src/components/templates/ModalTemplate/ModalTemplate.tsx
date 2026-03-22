/**
 * ModalTemplate — Template
 * Bottom sheet / modal overlay genérico.
 *
 * Estrutura interna:
 *   Modal → overlay (TouchableOpacity) + KeyboardAvoidingView (sheet)
 *     → handle (drag indicator)
 *     → content View  ← padding horizontal aplicado aqui (mais confiável no web
 *                        do que no próprio KeyboardAvoidingView)
 *       → {children}
 */

import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/theme';

interface ModalTemplateProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalTemplate({ visible, onClose, children }: ModalTemplateProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.content}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surfaceDark,
    //borderRadius: BorderRadius.xxl,
    borderBottomEndRadius: BorderRadius.xxl,
    marginHorizontal: Spacing.screenPaddingH,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.md,
  },
});
