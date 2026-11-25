import { useRouter } from 'expo-router';

import { StateMessage } from '@/components/ui/StateMessage';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function NotFoundScreen() {
  const router = useRouter();
  usePageTitle('Página no encontrada');

  return (
    <StateMessage
      icon="compass-outline"
      title="No encontramos esta página"
      description="El enlace puede estar incompleto o la página ya no existe."
      actionLabel="Ir al catálogo"
      actionIcon="grid-outline"
      onAction={() => router.replace('/')}
    />
  );
}
