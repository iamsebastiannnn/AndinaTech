import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { Button } from './Button';

interface StateMessageProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  tone?: 'neutral' | 'error';
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
}

export function StateMessage({
  icon,
  title,
  description,
  tone = 'neutral',
  actionLabel,
  actionIcon,
  onAction,
}: StateMessageProps) {
  const isError = tone === 'error';
  return (
    <View style={styles.container} accessibilityRole={isError ? 'alert' : undefined}>
      <View style={[styles.iconCircle, isError && styles.iconCircleError]}>
        <Ionicons name={icon} size={28} color={isError ? colors.danger : colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} icon={actionIcon} onPress={onAction} variant="outline" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconCircleError: { backgroundColor: colors.dangerSoft },
  title: { ...typography.subtitle, textAlign: 'center' },
  description: { ...typography.bodyMuted, textAlign: 'center', maxWidth: 420 },
  action: { marginTop: spacing.sm },
});
