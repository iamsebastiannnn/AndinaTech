import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';
import { formatCOP } from '@/utils/format';
import { getDiscountPercent } from '@/utils/pricing';

interface PriceBlockProps {
  price: number;
  previousPrice: number | null;
  size?: 'sm' | 'lg';
  tone?: 'default' | 'onInk';
}

export function PriceBlock({ price, previousPrice, size = 'sm', tone = 'default' }: PriceBlockProps) {
  const discount = getDiscountPercent(price, previousPrice);
  const large = size === 'lg';
  const onInk = tone === 'onInk';
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.price, large && styles.priceLarge, onInk && styles.onInk]} numberOfLines={1}>
          {formatCOP(price)}
        </Text>
        {discount ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{discount}%</Text>
          </View>
        ) : null}
      </View>
      {previousPrice ? (
        <Text style={[styles.previous, onInk && styles.previousOnInk]} numberOfLines={1}>
          Antes {formatCOP(previousPrice)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 1 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: spacing.sm, rowGap: 2 },
  price: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22, letterSpacing: -0.3, color: colors.text },
  priceLarge: { fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  onInk: { color: colors.onInk },
  previous: { fontSize: 12, lineHeight: 16, color: colors.textMuted, textDecorationLine: 'line-through' },
  previousOnInk: { color: colors.onInkMuted },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.accent },
  badgeText: { fontSize: 11, lineHeight: 14, fontWeight: '800', color: colors.onAccent },
});
