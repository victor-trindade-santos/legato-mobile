/**
 * LEGATO — Icon (Atom)
 *
 * Unifica ícones vetoriais (@expo/vector-icons) e assets de imagem (PNG/JPG)
 * em uma API única e extensível.
 *
 * USO — vetor:
 *   <Icon variant="vector" name="musical-note" size={24} color={Colors.white} />
 *   <Icon variant="vector" family="MaterialIcons" name="person" size={20} color={Colors.primary} />
 *
 * USO — imagem (logo, ícones de marca):
 *   <Icon variant="image" source={require('@/assets/icons/logo_legado_vertical_light.png')} width={100} height={120} />
 */

import React from 'react';
import { Image } from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
  Feather,
  AntDesign,
} from '@expo/vector-icons';

import type { IconProps, IconFamily } from './Icon.types';

const FAMILY_MAP: Record<IconFamily, React.ComponentType<any>> = {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
  Feather,
  AntDesign,
};

export function Icon(props: IconProps) {
  if (props.variant === 'image') {
    const { source, width, height, aspectRatio, resizeMode = 'contain', style } = props;
    return (
      <Image
        source={source}
        style={[{ width, height, aspectRatio }, style]}
        resizeMode={resizeMode}
      />
    );
  }

  const { family = 'Ionicons', name, size = 24, color, style } = props;
  const VectorIcon = FAMILY_MAP[family];
  return <VectorIcon name={name} size={size} color={color} style={style} />;
}
