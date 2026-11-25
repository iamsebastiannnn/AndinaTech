import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { LiveStatus } from '@/types';

const STATES: Record<LiveStatus, { label: string; color: string; background: string }> = {
  connected: { label: 'En vivo', color: colors.success, background: colors.successSoft },
  connecting: { label: 'Conectando…', color: colors.warning, background: colors.warningSoft },
  disconnected: { label: 'Sin conexión en vivo', color: colors.danger, background: colors.dangerSoft },
};

export function LiveIndicator({ status }: { status: LiveStatus }) {
  const { label, color, background } = STATES[status];
  return (
    <View
      style={[styles.pill, { backgroundColor: background }]}
      accessible
      accessibilityLabel={`Actualización en tiempo real: ${label}`}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 12, fontWeight: '700' },
});
