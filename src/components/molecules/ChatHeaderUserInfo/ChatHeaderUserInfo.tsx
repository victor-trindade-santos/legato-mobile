import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/theme';

import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { LegatoText } from '@/components/atoms/Text/Text';
import { StatusDot } from '@/components/atoms/StatusDot/StatusDot';
import { Spacer } from '@/components/atoms/Spacer/Spacer';

import type { ChatHeaderUserInfoProps } from './ChatHeaderUserInfo.types';

export function ChatHeaderUserInfo({
  avatarUri,
  fallbackInitials,
  name,
  statusText,
  statusVariant = 'offline',
}: ChatHeaderUserInfoProps) {
  return (
    <View style={styles.container}>
      <Avatar
        uri={avatarUri}
        fallbackInitials={fallbackInitials}
        size="md"
      />

      <Spacer horizontal size={Spacing.sm} />

      <View style={styles.info}>
        <LegatoText variant="subtitle" color={Colors.textPrimaryDark}>
          {name}
        </LegatoText>

        <Spacer size={4} />

        <View style={styles.statusRow}>
          <StatusDot variant={statusVariant} size={8} />

          <Spacer horizontal size={6} />

          <LegatoText variant="caption" color={Colors.textMuted}>
            {statusText}
          </LegatoText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flexDirection: 'column',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});