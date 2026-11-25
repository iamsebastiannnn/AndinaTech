import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { SearchField } from '@/components/ui/SearchField';
import { StateMessage } from '@/components/ui/StateMessage';
import { LiveIndicator } from '@/components/users/LiveIndicator';
import { UsersList } from '@/components/users/UsersList';
import { UsersSkeleton } from '@/components/users/UsersSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useUsersDirectory } from '@/hooks/useUsersDirectory';
import { colors, radius, spacing, typography } from '@/theme';

export default function UsersScreen() {
  usePageTitle('Usuarios registrados');
  const { user } = useAuth();
  const directory = useUsersDirectory(user?.id ?? null);

  function renderResults() {
    if (directory.isLoading) return <UsersSkeleton />;

    if (directory.error && !directory.hasLoaded) {
      return (
        <StateMessage
          tone="error"
          icon="cloud-offline-outline"
          title="No pudimos consultar los usuarios"
          description={directory.error}
          actionLabel="Reintentar"
          actionIcon="refresh"
          onAction={directory.refresh}
        />
      );
    }

    if (directory.total === 0) {
      return (
        <StateMessage
          icon="people-outline"
          title="Aún no hay usuarios registrados"
          description="Cuando alguien cree una cuenta aparecerá aquí automáticamente."
        />
      );
    }

    if (directory.profiles.length === 0) {
      return (
        <StateMessage
          icon="search-outline"
          title="Ningún usuario coincide"
          description={`No encontramos usuarios con “${directory.query.trim()}”. Busca por nombre, correo o teléfono.`}
          actionLabel="Borrar búsqueda"
          actionIcon="close-circle-outline"
          onAction={() => directory.setQuery('')}
        />
      );
    }

    return <UsersList profiles={directory.profiles} currentUserId={user?.id ?? null} />;
  }

  return (
    <View style={styles.page}>
      <View style={styles.heading}>
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.title} accessibilityRole="header">
              Usuarios registrados
            </Text>
            {directory.hasLoaded ? (
              <View style={styles.total} accessible accessibilityLabel={`Total: ${directory.total} ${directory.total === 1 ? 'usuario' : 'usuarios'}`}>
                <Text style={styles.totalText}>{directory.total}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.actions}>
          <LiveIndicator status={directory.liveStatus} />
          <Button
            label={directory.isSyncing ? 'Actualizando…' : 'Actualizar'}
            icon="refresh"
            variant="outline"
            onPress={directory.refresh}
            loading={directory.isSyncing}
            accessibilityLabel="Actualizar la lista de usuarios"
          />
        </View>
      </View>

      {directory.liveStatus === 'disconnected' ? (
        <Notice
          tone="warning"
          message="Se interrumpió la actualización en vivo. Los cambios nuevos no aparecerán solos: pulsa “Actualizar” para reconectar."
        />
      ) : null}

      {directory.error && directory.hasLoaded ? <Notice tone="error" message={directory.error} /> : null}

      <SearchField
        value={directory.query}
        onChangeText={directory.setQuery}
        placeholder="Nombre, correo o teléfono"
        accessibilityLabel="Buscar usuarios"
      />

      {renderResults()}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.md },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: { flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexGrow: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  title: { ...typography.title },
  total: {
    minWidth: 28,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  totalText: { color: colors.onPrimary, fontSize: 13, fontWeight: '700' },
});
