/**
 * ModalTemplate — Template
 * Bottom sheet / modal overlay genérico.
 *
 * Estrutura interna:
 *   Modal → container (flex: 1, justifyContent: flex-end)
 *     → overlay (absoluteFill, Animated.View + TouchableOpacity) — fade-in independente
 *     → Animated.View (sheet wrapper) — slide-up independente
 *       → KeyboardAvoidingView (sheet)
 *         → handle (drag indicator)
 *         → content View  ← padding horizontal aplicado aqui
 *           → {children}
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useColors, ThemeOverrideContext, light } from '@/hooks/useColors';

interface ModalTemplateProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  forceLightTheme?: boolean;
}

export function ModalTemplate({ visible, onClose, children, forceLightTheme }: ModalTemplateProps) {
  const themeColors = useColors();
  const colors = forceLightTheme ? light : themeColors;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const isClosingRef = useRef(false);

  const animateClose = useCallback((callback?: () => void) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 300, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setModalVisible(false);
      callback?.();
    });
  }, [overlayOpacity, sheetTranslateY]);

  const handleClose = useCallback(() => {
    animateClose(onClose);
  }, [animateClose, onClose]);

  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setModalVisible(true);
    } else if (!isClosingRef.current) {
      animateClose();
    }
  }, [visible]);

  const handleShow = useCallback(() => {
    overlayOpacity.setValue(0);
    sheetTranslateY.setValue(300);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [overlayOpacity, sheetTranslateY]);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleClose} onShow={handleShow}>
      <View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY: sheetTranslateY }] }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={styles.handle} />
            <View style={styles.content}>
              <ThemeOverrideContext.Provider value={forceLightTheme ? 'light' : null}>
                {children}
              </ThemeOverrideContext.Provider>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
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
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
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
