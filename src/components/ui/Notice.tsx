import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type Tone = 'error' | 'warning' | 'success' | 'info';

const TONES: Record<Tone, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  error: { bg: colors.dangerSoft, fg: colors.danger, icon: 'alert-circle' },
  warning: { bg: colors.warningSoft, fg: colors.warning, icon: 'warning' },
  success: { bg: colors.successSoft, fg: colors.success, icon: 'checkmark-circle' },
  info: { bg: colors.primarySoft, fg: colors.primary, icon: 'information-circle' },
};

export function Notice({ tone, message }: { tone: Tone; message: string }) {
  const { bg, fg, icon } = TONES[tone];
  return (
    <View
      style={[styles.container, { backgroundColor: bg }]}
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={icon} size={18} color={fg} style={styles.icon} />
      <Text style={[styles.text, { color: fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  icon: { marginTop: 1 },
  text: { ...typography.small, flex: 1, fontWeight: '600' },
});
