import { useWindowDimensions } from 'react-native';

import { breakpoints } from '@/theme';

export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const isTablet = !isDesktop && width >= breakpoints.tablet;
  return { width, height, isDesktop, isTablet, isMobile: !isDesktop && !isTablet };
}
