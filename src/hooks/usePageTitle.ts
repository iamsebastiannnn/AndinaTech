import { useEffect } from 'react';
import { Platform } from 'react-native';

import { APP_CONFIG } from '@/config/app';

export function usePageTitle(title: string) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.title = `${title} · ${APP_CONFIG.companyName}`;
  }, [title]);
}
