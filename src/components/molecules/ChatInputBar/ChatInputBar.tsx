/**
 * ChatInputBar — Molecule
 *
 * Barra fixa no rodapé do chat responsável por:
 *  - receber o texto da mensagem
 *  - permitir anexos
 *  - permitir emoji
 *  - enviar a mensagem
 *
 * NÃO sabe:
 *  - quem é o usuário
 *  - estado do chat
 *  - lista de mensagens
 *
 * Template visual:
 *
 *  [📎]  [  Input expansível............... ]  [😊]  [➤]
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { LegatoText } from '@/components/atoms/Text/Text';

import { Input } from '@/components/atoms/Input/Input';
import { Icon } from '@/components/atoms/Icon/Icon';
import { Spacer } from '@/components/atoms/Spacer/Spacer';

import type { ChatInputBarProps } from './ChatInputBar.types';

const MIN_HEIGHT = 30;
const MAX_HEIGHT = 120;

const formatMs = (ms: number): string => {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  onAttach,
  onMic,
  onEmoji,
  placeholder = 'Digite uma mensagem...',
  isRecording = false,
  recordingDurationMs = 0,
  onCancelRecording,
}: ChatInputBarProps) {
  const colors = useColors();
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRecording) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isRecording]);

  const handleContentSizeChange = (e: any) => {
    const { height } = e.nativeEvent.contentSize;
    setInputHeight(Math.min(Math.max(Math.ceil(height), MIN_HEIGHT), MAX_HEIGHT));
  };

  const handleSend = () => {
    onSend();
    setInputHeight(MIN_HEIGHT);
  };
  if (isRecording) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border, alignItems: 'center' }]}>
        {/* Cancel */}
        <TouchableOpacity onPress={onCancelRecording} style={styles.cancelButton} hitSlop={8}>
          <Icon variant="vector" name="close" family="Ionicons" size={22} color={Colors.textMuted} />
        </TouchableOpacity>

        <Spacer horizontal size={Spacing.sm} />

        {/* Pulsing dot + timer */}
        <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
        <Spacer horizontal size={Spacing.xs} />
        <LegatoText variant="body" color={Colors.error}>
          {formatMs(recordingDurationMs)}
        </LegatoText>

        {/* Spacer to push send button right */}
        <View style={{ flex: 1 }} />

        {/* Send */}
        <TouchableOpacity onPress={onMic} style={[styles.sendButton, styles.sendButtonRecording]}>
          <Icon variant="vector" name="send" family="Ionicons" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.inputWrapper}>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline
          onContentSizeChange={handleContentSizeChange}
          containerStyle={[styles.inputContainer, { minHeight: inputHeight }]}
          inputStyle={[styles.input, { height: inputHeight, paddingRight: onAttach ? 36 : undefined }]}
        />
        {onAttach && (
          <TouchableOpacity onPress={onAttach} style={styles.attachButton} hitSlop={8}>
            <Icon
              variant="vector"
              name="attach-outline"
              family="Ionicons"
              size={26}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      <Spacer horizontal size={Spacing.sm} />

      {onEmoji && (
        <>
          <TouchableOpacity onPress={onEmoji}>
            <Icon
              variant="vector"
              name="happy-outline"
              family="Ionicons"
              size={22}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
          <Spacer horizontal size={Spacing.sm} />
        </>
      )}

      {value.trim().length === 0 ? (
        <TouchableOpacity onPress={onMic} style={styles.sendButton}>
          <Icon
            variant="vector"
            name="mic"
            family="Ionicons"
            size={20}
            color={Colors.white}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Icon
            variant="vector"
            name="send"
            family="Ionicons"
            size={20}
            color={Colors.white}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  attachButton: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
  },
  inputContainer: {
    borderRadius: BorderRadius.pill,
    minHeight: 30,
  },
  input: {
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonRecording: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
});