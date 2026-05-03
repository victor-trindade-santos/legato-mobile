import type { ComponentType } from 'react';
import type { ImageSourcePropType, StyleProp, ViewStyle, ImageStyle } from 'react-native';

/**
 * Famílias de ícones vetoriais disponíveis (@expo/vector-icons).
 * Para adicionar uma nova família: inclua aqui e no FAMILY_MAP em Icon.tsx.
 */
export type IconFamily =
  | 'Ionicons'
  | 'MaterialIcons'
  | 'MaterialCommunityIcons'
  | 'FontAwesome'
  | 'Feather'
  | 'AntDesign';

export type IconProps =
  | {
      /** Ícone vetorial de @expo/vector-icons */
      variant: 'vector';
      /** Família de ícones. Default: Ionicons */
      family?: IconFamily;
      /** Nome do ícone dentro da família */
      name: string;
      size?: number;
      color?: string;
      style?: StyleProp<ViewStyle>;
    }
  | {
      /** Asset local (PNG, JPG) — logos e ícones de marca */
      variant: 'image';
      source: ImageSourcePropType | ComponentType<{ width?: number; height?: number; style?: any }>;
      /** Largura em px. Se omitido, usa height como referência. */
      width?: number;
      /** Altura em px. Se omitido, é calculada via aspectRatio. */
      height?: number;
      /**
       * Proporção largura/altura do conteúdo visível do PNG.
       * Útil quando o asset tem padding transparente:
       * basta definir width + aspectRatio e o height é calculado automaticamente.
       *
       * Exemplos:
       *  - Logo quadrado:   aspectRatio={1}
       *  - Logo vertical:   aspectRatio={0.5}  (metade da largura em altura)
       *  - Logo horizontal: aspectRatio={2}    (dobro da largura em altura)
       */
      aspectRatio?: number;
      resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
      style?: StyleProp<ImageStyle>;
    };
