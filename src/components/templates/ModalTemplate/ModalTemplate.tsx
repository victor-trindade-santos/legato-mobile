/**
 * ModalTemplate — Template
 * Bottom sheet / modal overlay genérico.
 *
 * Estrutura interna:
 *   Modal → container (flex: 1, justifyContent: flex-end)
 *     → overlay (absoluteFill, TouchableOpacity) — cobre a tela sem ocupar espaço no fluxo
 *     → KeyboardAvoidingView (sheet) — fica na base pelo justifyContent do container
 *       → handle (drag indicator)
 *       → content View  ← padding horizontal aplicado aqui (mais confiável no web
 *                          do que no próprio KeyboardAvoidingView)
 *         → {children}
 */

import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';

interface ModalTemplateProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalTemplate({ visible, onClose, children }: ModalTemplateProps) {
  const colors = useColors();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={[StyleSheet.absoluteFill, styles.overlay]} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.handle} />
          <View style={styles.content}>
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: Colors.overlay,
  },
  sheet: {
    borderRadius: BorderRadius.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
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
