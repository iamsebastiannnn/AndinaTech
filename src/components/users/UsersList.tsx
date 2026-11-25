import { StyleSheet, View } from 'react-native';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { spacing } from '@/theme';
import type { Profile } from '@/types';

import { UserCard } from './UserCard';
import { UsersTable } from './UsersTable';

interface UsersListProps {
  profiles: Profile[];
  currentUserId: string | null;
}

export function UsersList({ profiles, currentUserId }: UsersListProps) {
  const { isDesktop, isTablet } = useBreakpoint();

  if (isDesktop) return <UsersTable profiles={profiles} currentUserId={currentUserId} />;

  return (
    <View style={[styles.list, isTablet && styles.listTablet]}>
      {profiles.map((profile) => (
        <View key={profile.id} style={isTablet ? styles.itemTablet : undefined}>
          <UserCard profile={profile} isCurrentUser={profile.id === currentUserId} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  listTablet: { flexDirection: 'row', flexWrap: 'wrap' },
  itemTablet: { flexBasis: '48%', flexGrow: 1 },
});
