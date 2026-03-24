/**
 * RangeSlider — Molecule
 *
 * Slider horizontal com dois thumbs (mínimo e máximo).
 * Implementado com PanResponder nativo — sem dependências extras.
 * Funciona no Expo Web e em dispositivos nativos.
 *
 * USO:
 *   <RangeSlider
 *     label="Idade" unit="anos"
 *     min={16} max={99}
 *     minValue={filters.ageMin} maxValue={filters.ageMax}
 *     onMinChange={v => setLocal(p => ({ ...p, ageMin: v }))}
 *     onMaxChange={v => setLocal(p => ({ ...p, ageMax: v }))}
 *   />
 */

import React, { useRef, useState } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { LegatoText } from '@/components/atoms/Text/Text';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import type { RangeSliderProps } from './RangeSlider.types';

const THUMB = 22;
const TRACK_H = 4;

export function RangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  step = 1,
  label,
  unit = '',
}: RangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  // Refs evitam closures stale nos PanResponders
  const twRef = useRef(0);
  const minRef = useRef(minValue);
  const maxRef = useRef(maxValue);
  const onMinRef = useRef(onMinChange);
  const onMaxRef = useRef(onMaxChange);
  const minStartX = useRef(0);
  const maxStartX = useRef(0);

  minRef.current = minValue;
  maxRef.current = maxValue;
  onMinRef.current = onMinChange;
  onMaxRef.current = onMaxChange;

  const effectiveTrack = (tw: number) => tw - THUMB;

  const toX = (value: number, tw: number) =>
    ((value - min) / (max - min)) * effectiveTrack(tw);

  const toValue = (x: number, tw: number) => {
    const et = effectiveTrack(tw);
    const ratio = Math.max(0, Math.min(1, x / et));
    const raw = ratio * (max - min) + min;
    return Math.round(raw / step) * step;
  };

  const minPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        minStartX.current = toX(minRef.current, twRef.current);
      },
      onPanResponderMove: (_, gs) => {
        const newVal = toValue(minStartX.current + gs.dx, twRef.current);
        if (newVal < maxRef.current) onMinRef.current(newVal);
      },
    })
  ).current;

  const maxPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        maxStartX.current = toX(maxRef.current, twRef.current);
      },
      onPanResponderMove: (_, gs) => {
        const newVal = toValue(maxStartX.current + gs.dx, twRef.current);
        if (newVal > minRef.current) onMaxRef.current(newVal);
      },
    })
  ).current;

  const minX = trackWidth > 0 ? toX(minValue, trackWidth) : 0;
  const maxX = trackWidth > 0 ? toX(maxValue, trackWidth) : 0;

  return (
    <View style={styles.container}>
      {/* Rótulo e valores */}
      <View style={styles.labelRow}>
        <LegatoText style={styles.label}>{label}</LegatoText>
        <LegatoText style={styles.values}>
          {minValue} — {maxValue} {unit}
        </LegatoText>
      </View>

      {/* Track */}
      <View
        style={styles.trackWrapper}
        onLayout={e => {
          const w = e.nativeEvent.layout.width;
          setTrackWidth(w);
          twRef.current = w;
        }}
      >
        {/* Trilha inativa */}
        <View style={styles.track} />

        {trackWidth > 0 && (
          <>
            {/* Preenchimento ativo (entre os dois thumbs) */}
            <View
              style={[
                styles.fill,
                {
                  left: minX + THUMB / 2,
                  right: trackWidth - maxX - THUMB / 2,
                },
              ]}
            />

            {/* Thumb esquerdo (minValue) */}
            <View
              style={[styles.thumb, { left: minX }]}
              {...minPan.panHandlers}
            />

            {/* Thumb direito (maxValue) */}
            <View
              style={[styles.thumb, { left: maxX }]}
              {...maxPan.panHandlers}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    color: Colors.textSecondaryDark,
    fontSize: Typography.FontSize.xs,
    fontWeight: Typography.FontWeight.semiBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  values: {
    color: Colors.white,
    fontSize: Typography.FontSize.xs,
    fontWeight: Typography.FontWeight.semiBold,
  },
  trackWrapper: {
    height: THUMB,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: TRACK_H,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.border,
  },
  fill: {
    position: 'absolute',
    height: TRACK_H,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    top: (THUMB - TRACK_H) / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
    // Sombra sutil para destacar o thumb
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
