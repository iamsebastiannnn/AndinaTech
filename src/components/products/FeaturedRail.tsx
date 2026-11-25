import { ScrollView, StyleSheet } from 'react-native';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { spacing, stageTints } from '@/theme';
import type { Product } from '@/types';

import { ProductCard } from './ProductCard';

export function FeaturedRail({ products }: { products: Product[] }) {
  const { isDesktop, isTablet } = useBreakpoint();
  const cardWidth = isDesktop ? 250 : isTablet ? 220 : 190;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.bleed}
      decelerationRate="fast"
      snapToInterval={cardWidth + spacing.md}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          width={cardWidth}
          tint={stageTints[(index + 2) % stageTints.length]}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bleed: { marginHorizontal: -spacing.lg },
  content: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, alignItems: 'stretch' },
});
