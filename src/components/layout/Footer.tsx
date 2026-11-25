import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/ui/Logo';
import { APP_CONFIG } from '@/config/app';
import { colors, layout, spacing } from '@/theme';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <View style={styles.bar} accessibilityRole="summary">
      <View style={styles.content}>
        <Logo variant="full" size={76} />
        <Text style={styles.text}>
          <Text style={styles.strong}>Desarrollado por: </Text>
          {APP_CONFIG.team.join(' · ')}
        </Text>
        <Text style={styles.text}>
          © {year} {APP_CONFIG.companyName} · Versión {APP_CONFIG.version} · Todos los derechos reservados
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primaryDark,
    marginTop: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  text: { color: colors.onPrimaryMuted, fontSize: 12, lineHeight: 17 },
  strong: { fontWeight: '700' },
});
