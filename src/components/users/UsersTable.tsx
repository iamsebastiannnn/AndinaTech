import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { cardShadow, colors, radius, spacing, typography } from '@/theme';
import type { Profile } from '@/types';
import { formatDateTime, formatPhone } from '@/utils/format';

import { userBadgeStyles } from './UserCard';

interface UsersTableProps {
  profiles: Profile[];
  currentUserId: string | null;
}

export function UsersTable({ profiles, currentUserId }: UsersTableProps) {
  return (
    <View style={styles.table} accessibilityRole={'table' as never}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.headerCell, styles.colName]}>Nombre completo</Text>
        <Text style={[styles.headerCell, styles.colEmail]}>Correo</Text>
        <Text style={[styles.headerCell, styles.colPhone]}>Teléfono</Text>
        <Text style={[styles.headerCell, styles.colDate]}>Fecha de registro</Text>
      </View>
      {profiles.map((profile, index) => (
        <View key={profile.id} style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
          <View style={[styles.colName, styles.nameCell]}>
            <Avatar name={profile.fullName} size={32} />
            <Text style={[styles.cell, styles.name]}>{profile.fullName}</Text>
            {profile.id === currentUserId ? (
              <View style={userBadgeStyles.badge}>
                <Text style={userBadgeStyles.badgeText}>Tú</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.cell, styles.colEmail]} selectable>
            {profile.email}
          </Text>
          <Text style={[styles.cell, styles.colPhone]}>{formatPhone(profile.phone)}</Text>
          <Text style={[styles.cell, styles.colDate]}>{formatDateTime(profile.createdAt)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...cardShadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  headerRow: { backgroundColor: colors.primarySoft, borderTopWidth: 0 },
  rowAlt: { backgroundColor: colors.background },
  headerCell: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  cell: { ...typography.body, fontSize: 14, minWidth: 0 },
  colName: { flex: 3, minWidth: 0 },
  colEmail: { flex: 3 },
  colPhone: { flex: 1.5 },
  colDate: { flex: 2 },
  nameCell: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontWeight: '600', flexShrink: 1 },
});
