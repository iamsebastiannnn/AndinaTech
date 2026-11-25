import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      accessibilityRole="radio"
      accessibilityLabel={`Categoría: ${label}`}
      accessibilityState={{ selected, checked: selected }}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.ink, borderColor: colors.ink },
  pressed: { opacity: 0.8 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  labelSelected: { color: colors.onPrimary },
});
