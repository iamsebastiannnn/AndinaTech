import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { Logo } from '@/components/ui/Logo';
import { colors, layout, radius, spacing } from '@/theme';
import type { AuthStatus, SessionUser } from '@/types';
import { getFirstName } from '@/utils/format';

interface HeaderProps {
  status: AuthStatus;
  user: SessionUser | null;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  topInset?: number;
  navigation?: ReactNode;
}

function SessionIndicator({ status, user }: Pick<HeaderProps, 'status' | 'user'>) {
  if (status === 'loading') {
    return <ActivityIndicator size="small" color={colors.primary} accessibilityLabel="Comprobando sesión" />;
  }
  if (status === 'authenticated' && user) {
    return (
      <View style={styles.session} accessible accessibilityLabel={`Sesión iniciada como ${user.fullName}`}>
        <Avatar name={user.fullName} size={32} tone="onPrimary" />
        <Text style={styles.sessionName} numberOfLines={1}>
          {getFirstName(user.fullName)}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.guest} accessible accessibilityLabel="Sin sesión: navegas como invitado">
      <Ionicons name="person-outline" size={14} color={colors.ink} />
      <Text style={styles.guestText}>Invitado</Text>
    </View>
  );
}

export function Header({ status, user, isMenuOpen, onOpenMenu, topInset = 0, navigation }: HeaderProps) {
  return (
    <View style={[styles.bar, { paddingTop: topInset }]}>
      <View style={styles.content}>
        <IconButton
          icon="menu"
          accessibilityLabel={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onPress={onOpenMenu}
          color={colors.ink}
          size={26}
        />
        <Link href="/" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Andina Tech & Hogar: ir al catálogo" style={styles.brand}>
            <Logo />
          </Pressable>
        </Link>
        <View style={styles.navigation}>{navigation}</View>
        <SessionIndicator status={status} user={user} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  content: {
    height: layout.headerHeight,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
    paddingRight: spacing.lg,
  },
  brand: { flexShrink: 1, minHeight: layout.minTouchSize, justifyContent: 'center' },
  navigation: { flex: 1, alignItems: 'flex-end', minWidth: 0 },
  session: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, maxWidth: 150 },
  sessionName: { color: colors.ink, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  guest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  guestText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
});
