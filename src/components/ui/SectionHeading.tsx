import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: 'default' | 'onInk';
}

export function SectionHeading({ eyebrow, title, description, tone = 'default' }: SectionHeadingProps) {
  const onInk = tone === 'onInk';
  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={[styles.eyebrow, onInk && styles.eyebrowOnInk]}>{eyebrow}</Text> : null}
      <Text style={[styles.title, onInk && styles.titleOnInk]} accessibilityRole="header">
        {title}
      </Text>
      {description ? <Text style={[styles.description, onInk && styles.descriptionOnInk]}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs + 2, maxWidth: 620 },
  eyebrow: { ...typography.eyebrow, color: colors.accent },
  eyebrowOnInk: { color: colors.gold },
  title: { ...typography.title },
  titleOnInk: { color: colors.onInk },
  description: { ...typography.bodyMuted },
  descriptionOnInk: { color: colors.onInkMuted },
});
