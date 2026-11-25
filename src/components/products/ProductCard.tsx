import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { cardShadow, colors, radius, spacing, typography } from '@/theme';
import type { Product } from '@/types';
import { formatCOP } from '@/utils/format';

import { PriceBlock } from './PriceBlock';
import { ProductPhoto } from './ProductPhoto';

interface ProductCardProps {
  product: Product;
  width: number;
  tint?: string;
}

const useNativeDriver = Platform.OS !== 'web';

export const ProductCard = memo(function ProductCard({ product, width, tint }: ProductCardProps) {
  const router = useRouter();
  const [zoom] = useState(() => new Animated.Value(1));
  const soldOut = product.stock <= 0;

  const animateTo = (toValue: number) =>
    Animated.spring(zoom, { toValue, useNativeDriver, speed: 18, bounciness: 4 }).start();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/product/[sku]', params: { sku: product.sku } })}
      onHoverIn={() => animateTo(1.05)}
      onHoverOut={() => animateTo(1)}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      accessibilityRole="link"
      accessibilityLabel={`${product.name}. ${formatCOP(product.price)}. ${soldOut ? 'Agotado' : 'Disponible'}. Ver detalle.`}
      style={[styles.card, { width }]}
    >
      <View style={styles.photoBox}>
        <Animated.View style={[styles.photoInner, { transform: [{ scale: zoom }] }, soldOut && styles.soldOut]}>
          <ProductPhoto image={product.images[0]} tint={tint} label={product.name} style={styles.photo} />
        </Animated.View>
      </View>
      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand ?? product.categoryName}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <PriceBlock price={product.price} previousPrice={product.previousPrice} />
          <View style={styles.availability}>
            <View style={[styles.dot, { backgroundColor: soldOut ? colors.textDisabled : colors.success }]} />
            <Text style={[styles.availabilityText, soldOut && styles.availabilityOut]}>
              {soldOut ? 'Agotado' : 'Disponible'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...cardShadow,
  },
  photoBox: { width: '100%', aspectRatio: 1, overflow: 'hidden', backgroundColor: colors.stage },
  photoInner: { flex: 1 },
  photo: { flex: 1 },
  soldOut: { opacity: 0.5 },
  body: { flex: 1, padding: spacing.md, gap: spacing.xs },
  brand: { ...typography.eyebrow, fontSize: 10 },
  name: { fontSize: 13.5, lineHeight: 18, minHeight: 36, fontWeight: '600', color: colors.text },
  footer: { marginTop: 'auto', paddingTop: spacing.xs, gap: spacing.xs },
  availability: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  availabilityText: { fontSize: 12, fontWeight: '600', color: colors.success },
  availabilityOut: { color: colors.textMuted },
});
