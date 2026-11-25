import { StyleSheet, Text, View } from 'react-native';

import { APP_CONFIG } from '@/config/app';
import { colors, radius, spacing } from '@/theme';

interface LogoProps {
  tone?: 'onPrimary' | 'default';
  compact?: boolean;
}

export function Logo({ tone = 'default', compact = false }: LogoProps) {
  const textColor = tone === 'onPrimary' ? colors.onPrimary : colors.primary;
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel={APP_CONFIG.companyName}>
      <View style={styles.mark}>
        <Text style={styles.markLetter}>A</Text>
        <View style={styles.markBar} />
      </View>
      {compact ? null : (
        <View style={styles.texts}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            Andina
          </Text>
          <Text style={[styles.sub, { color: tone === 'onPrimary' ? colors.onPrimaryMuted : colors.textMuted }]} numberOfLines={1}>
            TECH &amp; HOGAR
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  mark: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markLetter: { color: colors.onAccent, fontSize: 20, lineHeight: 24, fontWeight: '800' },
  markBar: { width: 16, height: 2, borderRadius: 1, backgroundColor: colors.onAccent, opacity: 0.85 },
  texts: { flexShrink: 1 },
  name: { fontSize: 17, lineHeight: 20, fontWeight: '800', letterSpacing: 0.2 },
  sub: { fontSize: 10, lineHeight: 13, fontWeight: '700', letterSpacing: 1.4 },
});
