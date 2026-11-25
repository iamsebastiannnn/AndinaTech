import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { isNavItemActive, type NavItem } from '@/config/navigation';
import { colors, layout, radius, spacing } from '@/theme';

interface NavBarProps {
  items: NavItem[];
  pathname: string;
  onSelect: (item: NavItem) => void;
  variant: 'bottom' | 'horizontal';
  bottomInset?: number;
  disabled?: boolean;
}

export function NavBar({ items, pathname, onSelect, variant, bottomInset = 0, disabled = false }: NavBarProps) {
  const isBottom = variant === 'bottom';

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Navegación principal"
      style={isBottom ? [styles.bottomBar, { paddingBottom: bottomInset }] : styles.horizontalBar}
    >
      {items.map((item) => {
        const active = isNavItemActive(item, pathname);
        const color = isBottom ? (active ? colors.ink : colors.textMuted) : active ? colors.onInk : colors.ink;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item)}
            disabled={disabled}
            accessibilityRole={item.action ? 'button' : 'tab'}
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active, disabled }}
            style={({ pressed }) => [
              isBottom ? styles.bottomItem : styles.horizontalItem,
              !isBottom && active && styles.horizontalItemActive,
              pressed && styles.pressed,
            ]}
          >
            {isBottom ? <View style={[styles.indicator, active && styles.indicatorActive]} /> : null}
            <Ionicons name={active ? item.activeIcon : item.icon} size={isBottom ? 22 : 17} color={color} />
            <Text
              style={[isBottom ? styles.bottomLabel : styles.horizontalLabel, { color }, active && styles.labelActive]}
              numberOfLines={1}
            >
              {isBottom ? item.shortLabel : item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomItem: {
    flex: 1,
    height: layout.bottomNavHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 36,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'transparent',
  },
  indicatorActive: { backgroundColor: colors.accent },
  bottomLabel: { fontSize: 12, lineHeight: 15, fontWeight: '500' },
  labelActive: { fontWeight: '700' },
  horizontalBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  horizontalItem: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  horizontalItemActive: { backgroundColor: colors.ink },
  horizontalLabel: { fontSize: 14, fontWeight: '500' },
  pressed: { opacity: 0.7 },
});
