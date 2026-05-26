import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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
  onAvatarPress,
  onNamePress,
}: ChatHeaderUserInfoProps) {
  const InfoWrapper = onNamePress ? TouchableOpacity : View;

  return (
    <View style={styles.container}>
      {onAvatarPress ? (
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
          <Avatar uri={avatarUri} fallbackInitials={fallbackInitials} size="md" />
        </TouchableOpacity>
      ) : (
        <Avatar uri={avatarUri} fallbackInitials={fallbackInitials} size="md" />
      )}

      <Spacer horizontal size={Spacing.sm} />

      <InfoWrapper style={styles.info} onPress={onNamePress} activeOpacity={0.7}>
        <LegatoText variant="subtitle" color={Colors.textPrimaryDark}>
          {name}
        </LegatoText>

        {statusText && (
          <>
            <Spacer size={4} />
            <View style={styles.statusRow}>
              <StatusDot variant={statusText === 'Online' ? 'online' : 'offline'} size={8} />
              <Spacer horizontal size={6} />
              <LegatoText variant="caption" color={Colors.textMuted}>
                {statusText}
              </LegatoText>
            </View>
          </>
        )}
      </InfoWrapper>
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