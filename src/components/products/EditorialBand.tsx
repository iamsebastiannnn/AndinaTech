import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, layout, radius, spacing } from '@/theme';
import type { Product } from '@/types';

import { PriceBlock } from './PriceBlock';
import { ProductPhoto } from './ProductPhoto';

interface EditorialBandProps {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  products: Product[];
}

function BandProduct({ product, large }: { product: Product; large: boolean }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/product/[sku]', params: { sku: product.sku } })}
      accessibilityRole="link"
      accessibilityLabel={`Ver ${product.name}`}
      style={({ pressed }) => [styles.product, large && styles.productLarge, pressed && styles.pressed]}
    >
      <ProductPhoto
        image={product.images[0]}
        size={large ? 'full' : 'thumb'}
        tint={colors.surface}
        padding={spacing.md}
        label={product.name}
        style={[styles.productPhoto, large && styles.productPhotoLarge]}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productBrand} numberOfLines={1}>
          {product.brand ?? product.categoryName}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <PriceBlock price={product.price} previousPrice={product.previousPrice} tone="onInk" />
      </View>
    </Pressable>
  );
}

export function EditorialBand({ eyebrow, title, description, actionLabel, onAction, products }: EditorialBandProps) {
  const { isDesktop } = useBreakpoint();
  const [lead, ...rest] = products;
  if (!lead) return null;

  return (
    <View style={[styles.band, isDesktop && styles.bandDesktop]}>
      <View style={[styles.intro, isDesktop && styles.introDesktop]}>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} tone="onInk" />
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.ink} />
        </Pressable>
      </View>
      <View style={[styles.products, isDesktop && styles.productsDesktop]}>
        <BandProduct product={lead} large />
        <View style={[styles.column, isDesktop && styles.columnDesktop]}>
          {rest.slice(0, 2).map((product) => (
            <BandProduct key={product.id} product={product} large={false} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xl },
  bandDesktop: { flexDirection: 'row', padding: 48, gap: 48, alignItems: 'center' },
  intro: { gap: spacing.lg, alignItems: 'flex-start' },
  introDesktop: { flex: 5 },
  action: {
    minHeight: layout.minTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  actionText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.85 },
  products: { gap: spacing.md },
  productsDesktop: { flex: 7, flexDirection: 'row' },
  column: { flexDirection: 'row', gap: spacing.md, alignItems: 'stretch' },
  columnDesktop: { flex: 1, flexDirection: 'column' },
  product: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  productLarge: { flex: 1.25 },
  productPhoto: { width: '100%', height: 130, borderRadius: radius.md },
  productPhotoLarge: { height: 230, flexGrow: 1 },
  productInfo: { paddingHorizontal: spacing.xs, paddingBottom: spacing.xs, gap: 3 },
  productBrand: { fontSize: 10, fontWeight: '700', letterSpacing: 1.3, textTransform: 'uppercase', color: colors.onInkMuted },
  productName: { fontSize: 13.5, lineHeight: 18, fontWeight: '600', color: colors.onInk },
});
