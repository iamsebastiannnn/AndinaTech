import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { cardShadow, colors, radius, spacing, typography } from '@/theme';
import type { Profile } from '@/types';
import { formatDateTime, formatPhone } from '@/utils/format';

interface UserCardProps {
  profile: Profile;
  isCurrentUser: boolean;
}

function Detail({ icon, text, selectable }: { icon: keyof typeof Ionicons.glyphMap; text: string; selectable?: boolean }) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={15} color={colors.textMuted} style={styles.detailIcon} />
      <Text style={styles.detailText} selectable={selectable}>
        {text}
      </Text>
    </View>
  );
}

export const UserCard = memo(function UserCard({ profile, isCurrentUser }: UserCardProps) {
  return (
    <View style={styles.card}>
      <Avatar name={profile.fullName} size={42} />
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.fullName}</Text>
          {isCurrentUser ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Tú</Text>
            </View>
          ) : null}
        </View>
        <Detail icon="mail-outline" text={profile.email} selectable />
        <Detail icon="call-outline" text={formatPhone(profile.phone)} />
        <Detail icon="calendar-outline" text={`Registro: ${formatDateTime(profile.createdAt)}`} />
      </View>
    </View>
  );
});

export const userBadgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.accent },
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  content: { flex: 1, minWidth: 0, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginBottom: 2 },
  name: { ...typography.label, fontSize: 15, flexShrink: 1 },
  badge: userBadgeStyles.badge,
  badgeText: userBadgeStyles.badgeText,
  detail: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  detailIcon: { marginTop: 2 },
  detailText: { ...typography.small, flex: 1, minWidth: 0 },
});
