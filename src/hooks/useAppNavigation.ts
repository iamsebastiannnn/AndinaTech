import { usePathname, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { getNavItems, type NavItem } from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAppNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const signingOut = useRef(false);

  const isAuthenticated = status === 'authenticated';
  const items = useMemo(() => getNavItems(isAuthenticated), [isAuthenticated]);

  const handleSignOut = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    setIsSigningOut(true);
    router.replace('/');
    try {
      await signOut();
    } finally {
      signingOut.current = false;
      setIsSigningOut(false);
    }
  }, [router, signOut]);

  const activate = useCallback(
    (item: NavItem) => {
      if (item.action === 'signOut') void handleSignOut();
      else if (item.href && item.href !== pathname) router.push(item.href);
    },
    [handleSignOut, pathname, router],
  );

  return { items, pathname, user, isAuthenticated, isSigningOut, activate };
}
