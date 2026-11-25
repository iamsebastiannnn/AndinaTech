import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, spacing } from '@/theme';

export function UsersSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.list} accessibilityLabel="Cargando usuarios registrados">
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.card}>
          <Skeleton width={42} height={42} borderRadius={radius.pill} />
          <View style={styles.lines}>
            <Skeleton width="55%" height={15} />
            <Skeleton width="80%" height={12} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lines: { flex: 1, gap: spacing.sm, justifyContent: 'center' },
});
