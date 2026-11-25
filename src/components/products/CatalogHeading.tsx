import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { APP_CONFIG } from '@/config/app';
import { colors, spacing, typography } from '@/theme';

export function CatalogHeading() {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {APP_CONFIG.tagline}
      </Text>
      <View style={styles.perks}>
        <View style={styles.perk}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.accent} />
          <Text style={styles.perkText}>Garantía directa</Text>
        </View>
        <View style={styles.perk}>
          <Ionicons name="cube-outline" size={14} color={colors.accent} />
          <Text style={styles.perkText}>Envíos a toda Colombia</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  title: { ...typography.title },
  perks: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: 2 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  perkText: { ...typography.small, fontWeight: '600' },
});
