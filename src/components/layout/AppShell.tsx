import { useCallback, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { colors } from '@/theme';

import { Footer } from './Footer';
import { HamburgerMenu } from './HamburgerMenu';
import { Header } from './Header';
import { NavBar } from './NavBar';
import { WorkArea } from './WorkArea';

export function AppShell({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useBreakpoint();
  const { status } = useAuth();
  const { items, pathname, user, isSigningOut, activate } = useAppNavigation();
  const isKeyboardVisible = useKeyboardVisible();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const navBar = (variant: 'bottom' | 'horizontal') => (
    <NavBar
      variant={variant}
      items={items}
      pathname={pathname}
      onSelect={activate}
      disabled={isSigningOut}
      bottomInset={variant === 'bottom' ? insets.bottom : 0}
    />
  );

  return (
    <View style={styles.shell}>
      <Header
        status={status}
        user={user}
        isMenuOpen={isMenuOpen}
        onOpenMenu={openMenu}
        topInset={insets.top}
        navigation={isDesktop ? navBar('horizontal') : null}
      />

      <WorkArea pathname={pathname} footer={<Footer />} horizontalInsets={{ left: insets.left, right: insets.right }}>
        {children}
      </WorkArea>

      {!isDesktop && !isKeyboardVisible ? navBar('bottom') : null}

      <HamburgerMenu
        visible={isMenuOpen}
        onClose={closeMenu}
        items={items}
        pathname={pathname}
        user={user}
        onSelect={activate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.background },
});
