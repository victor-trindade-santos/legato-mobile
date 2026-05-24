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

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';

import { Input } from '@/components/atoms/Input/Input';
import { Icon } from '@/components/atoms/Icon/Icon';
import { Spacer } from '@/components/atoms/Spacer/Spacer';

import type { ChatInputBarProps } from './ChatInputBar.types';

const MIN_HEIGHT = 30;
const MAX_HEIGHT = 120;

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  onAttach,
  onEmoji,
  placeholder = 'Digite uma mensagem...',
}: ChatInputBarProps) {
  const colors = useColors();
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);

  const handleContentSizeChange = (e: any) => {
    const { height } = e.nativeEvent.contentSize;
    setInputHeight(Math.min(Math.max(Math.ceil(height), MIN_HEIGHT), MAX_HEIGHT));
  };

  const handleSend = () => {
    onSend();
    setInputHeight(MIN_HEIGHT);
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {onAttach && (
        <>
          <TouchableOpacity onPress={onAttach}>
            <Icon
              variant="vector"
              name="attach"
              family="MaterialIcons"
              size={22}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
          <Spacer horizontal size={Spacing.sm} />
        </>
      )}

      <View style={styles.inputWrapper}>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline
          onContentSizeChange={handleContentSizeChange}
          containerStyle={[styles.inputContainer, { minHeight: inputHeight }]}
          inputStyle={[styles.input, { height: inputHeight }]}
        />
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

      <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
        <Icon
          variant="vector"
          name="send"
          family="Ionicons"
          size={20}
          color={Colors.white}
        />
      </TouchableOpacity>
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
  },
  inputContainer: {
    borderRadius: BorderRadius.pill,
    minHeight: 40,
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
});