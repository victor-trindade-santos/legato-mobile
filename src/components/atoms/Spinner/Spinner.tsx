import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/theme';
import { useColors } from '@/hooks/useColors';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export function Spinner({ size = 'large', color = Colors.primary, fullScreen = false }: SpinnerProps) {
  const colors = useColors();

  if (fullScreen) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={color} />;
}
