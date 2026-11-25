import { Redirect, Slot } from 'expo-router';

import { ViewLoader } from '@/components/ui/ViewLoader';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedLayout() {
  const { status } = useAuth();

  if (status === 'loading') return <ViewLoader label="Comprobando tu sesión…" />;
  if (status !== 'authenticated') return <Redirect href="/login" />;
  return <Slot />;
}
