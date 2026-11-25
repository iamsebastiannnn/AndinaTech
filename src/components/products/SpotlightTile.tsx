import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing, typography } from '@/theme';
import type { Product } from '@/types';

import { PriceBlock } from './PriceBlock';
import { ProductPhoto } from './ProductPhoto';

interface SpotlightTileProps {
  eyebrow: string;
  title: string;
  product: Product;
  tint: string;
  wide: boolean;
}

export function SpotlightTile({ eyebrow, title, product, tint, wide }: SpotlightTileProps) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/product/[sku]', params: { sku: product.sku } })}
      accessibilityRole="link"
      accessibilityLabel={`${title}. Ver ${product.name}`}
      style={({ pressed }) => [styles.tile, wide && styles.tileWide, { backgroundColor: tint }, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={[styles.title, wide && styles.titleWide]} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <PriceBlock price={product.price} previousPrice={product.previousPrice} />
          <View style={styles.arrow}>
            <Ionicons name="arrow-forward" size={16} color={colors.onInk} />
          </View>
        </View>
      </View>
      <ProductPhoto
        image={product.images[0]}
        size="full"
        tint={tint}
        padding={0}
        label={product.name}
        style={[styles.photo, wide && styles.photoWide]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg, overflow: 'hidden' },
  tileWide: { flex: 1, padding: 36, minHeight: 420 },
  pressed: { opacity: 0.9 },
  copy: { gap: spacing.sm },
  eyebrow: { ...typography.eyebrow, color: colors.accent },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, letterSpacing: -0.7, color: colors.ink },
  titleWide: { fontSize: 34, lineHeight: 38, letterSpacing: -1 },
  name: { ...typography.small, maxWidth: 360 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.xs },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { height: 190 },
  photoWide: { flex: 1, minHeight: 200 },
});
