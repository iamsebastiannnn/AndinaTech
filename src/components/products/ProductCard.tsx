import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cardShadow, colors, radius, spacing } from '@/theme';
import type { Product } from '@/types';
import { formatCOP } from '@/utils/format';

const LOW_STOCK = 5;

function getAvailability(stock: number) {
  if (stock <= 0) return { label: 'Agotado', color: colors.textMuted, icon: 'close-circle' as const };
  if (stock <= LOW_STOCK) return { label: 'Últimas unidades', color: colors.warning, icon: 'alert-circle' as const };
  return { label: 'Disponible', color: colors.success, icon: 'checkmark-circle' as const };
}

function ImageFallback() {
  return (
    <View style={styles.fallback} accessible accessibilityLabel="Imagen no disponible">
      <Ionicons name="image-outline" size={30} color={colors.textDisabled} />
      <Text style={styles.fallbackText}>Imagen no disponible</Text>
    </View>
  );
}

interface ProductCardProps {
  product: Product;
  width: number;
}

export const ProductCard = memo(function ProductCard({ product, width }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const availability = getAvailability(product.stock);
  const isSoldOut = product.stock <= 0;

  return (
    <View
      style={[styles.card, { width }]}
      accessible
      accessibilityLabel={`${product.name}. ${product.categoryName}. ${formatCOP(product.price)}. ${availability.label}.`}
    >
      <View style={styles.imageBox}>
        {product.imageUrl && !imageFailed ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={[styles.image, isSoldOut && styles.imageSoldOut]}
            contentFit="cover"
            transition={150}
            onError={() => setImageFailed(true)}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <ImageFallback />
        )}
        <View style={styles.category}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {product.categoryName}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {product.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {formatCOP(product.price)}
          </Text>
          <View style={styles.availability}>
            <Ionicons name={availability.icon} size={14} color={availability.color} />
            <Text style={[styles.availabilityText, { color: availability.color }]} numberOfLines={1}>
              {availability.label}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...cardShadow,
  },
  imageBox: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.surfaceMuted },
  image: { width: '100%', height: '100%' },
  imageSoldOut: { opacity: 0.55 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, padding: spacing.sm },
  fallbackText: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  category: {
    position: 'absolute',
    left: spacing.sm,
    top: spacing.sm,
    maxWidth: '85%',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  categoryText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  body: { flex: 1, padding: spacing.md, gap: spacing.xs },
  name: { fontSize: 14, lineHeight: 19, minHeight: 38, fontWeight: '700', color: colors.text },
  description: { fontSize: 12.5, lineHeight: 17, minHeight: 51, color: colors.textMuted },
  footer: { marginTop: 'auto', paddingTop: spacing.xs, gap: 2 },
  price: { fontSize: 17, lineHeight: 23, fontWeight: '800', color: colors.primary },
  availability: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  availabilityText: { fontSize: 12, fontWeight: '600', flexShrink: 1 },
});
