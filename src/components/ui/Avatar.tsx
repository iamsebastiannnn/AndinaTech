import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';
import { getInitial } from '@/utils/format';

interface AvatarProps {
  name: string;
  size?: number;
  tone?: 'onPrimary' | 'soft';
}

export function Avatar({ name, size = 36, tone = 'soft' }: AvatarProps) {
  const onPrimary = tone === 'onPrimary';
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, backgroundColor: onPrimary ? colors.gold : colors.primarySoft },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.44, color: onPrimary ? colors.ink : colors.primary }]}>
        {getInitial(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  initial: { fontWeight: '700' },
});
