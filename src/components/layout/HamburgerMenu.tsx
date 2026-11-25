import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { Logo } from '@/components/ui/Logo';
import { APP_CONFIG } from '@/config/app';
import { isNavItemActive, type NavItem } from '@/config/navigation';
import { colors, layout, radius, spacing, typography } from '@/theme';
import type { SessionUser } from '@/types';

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  items: NavItem[];
  pathname: string;
  user: SessionUser | null;
  onSelect: (item: NavItem) => void;
}

const PANEL_WIDTH = 300;
const useNativeDriver = Platform.OS !== 'web';

export function HamburgerMenu({ visible, onClose, items, pathname, user, onSelect }: HamburgerMenuProps) {
  const insets = useSafeAreaInsets();
  const [progress] = useState(() => new Animated.Value(0));
  const [isMounted, setIsMounted] = useState(visible);
  if (visible && !isMounted) setIsMounted(true);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 220 : 160,
      useNativeDriver,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setIsMounted(false);
    });
    return () => animation.stop();
  }, [visible, progress]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible, onClose]);

  if (!isMounted) return null;

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-PANEL_WIDTH, 0] });

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar menú"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, transform: [{ translateX }] },
          ]}
          accessibilityViewIsModal
          accessibilityLabel="Menú principal"
        >
          <View style={styles.panelHeader}>
            <Logo size={28} />
            <IconButton icon="close" accessibilityLabel="Cerrar menú" onPress={onClose} color={colors.onInk} />
          </View>

          <View style={styles.session}>
            {user ? (
              <>
                <Avatar name={user.fullName} size={44} />
                <View style={styles.sessionTexts}>
                  <Text style={styles.sessionName} numberOfLines={1}>
                    {user.fullName}
                  </Text>
                  <Text style={styles.sessionEmail} numberOfLines={1} ellipsizeMode="middle">
                    {user.email}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.guestIcon}>
                  <Ionicons name="person-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.sessionTexts}>
                  <Text style={styles.sessionName}>Invitado</Text>
                  <Text style={styles.sessionEmail}>Inicia sesión para ver los usuarios registrados</Text>
                </View>
              </>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.items} accessibilityRole="menu">
            {items.map((item) => {
              const active = isNavItemActive(item, pathname);
              const isSignOut = item.action === 'signOut';
              const color = isSignOut ? colors.danger : active ? colors.primary : colors.text;
              return (
                <View key={item.key}>
                  {isSignOut ? <View style={styles.divider} /> : null}
                  <Pressable
                    onPress={() => {
                      onClose();
                      onSelect(item);
                    }}
                    accessibilityRole="menuitem"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.itemPressed]}
                  >
                    <Ionicons name={active ? item.activeIcon : item.icon} size={21} color={color} />
                    <Text style={[styles.itemLabel, { color }, active && styles.itemLabelActive]}>{item.label}</Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          <Text style={styles.version}>
            {APP_CONFIG.companyName} · v{APP_CONFIG.version}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  panel: {
    width: PANEL_WIDTH,
    maxWidth: '86%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  panelHeader: {
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    height: layout.headerHeight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  guestIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTexts: { flex: 1, minWidth: 0 },
  sessionName: { ...typography.label, fontSize: 15 },
  sessionEmail: { ...typography.small },
  items: { padding: spacing.sm, gap: 2 },
  item: {
    minHeight: layout.minTouchSize + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  itemActive: { backgroundColor: colors.primarySoft },
  itemPressed: { backgroundColor: colors.surfaceMuted },
  itemLabel: { fontSize: 15, fontWeight: '500' },
  itemLabelActive: { fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm, marginHorizontal: spacing.md },
  version: { ...typography.caption, textAlign: 'center', padding: spacing.md },
});
