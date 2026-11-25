import { Link, type Href } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { colors, typography } from '@/theme';

interface AuthSwitchLinkProps {
  question: string;
  linkLabel: string;
  href: Href;
}

export function AuthSwitchLink({ question, linkLabel, href }: AuthSwitchLinkProps) {
  return (
    <Text style={styles.text}>
      {question}{' '}
      <Link href={href} style={styles.link} accessibilityRole="link">
        {linkLabel}
      </Link>
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { ...typography.small, textAlign: 'center', paddingVertical: 6 },
  link: { color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
});
