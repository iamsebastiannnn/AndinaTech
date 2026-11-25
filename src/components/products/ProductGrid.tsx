import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cardShadow, colors, layout, radius, spacing } from '@/theme';
import type { Product } from '@/types';

import { ProductCard } from './ProductCard';

const GAP = spacing.md;

function getColumns(gridWidth: number): number {
  if (gridWidth >= 1000) return 4;
  if (gridWidth >= 680) return 3;
  if (gridWidth >= 300) return 2;
  return 1;
}

function ProductCardSkeleton({ width }: { width: number }) {
  return (
    <View style={[styles.skeletonCard, { width }]}>
      <View style={styles.skeletonImage}>
        <Skeleton height="100%" borderRadius={0} />
      </View>
      <View style={styles.skeletonBody}>
        <Skeleton width="85%" height={15} />
        <Skeleton width="60%" height={15} />
        <Skeleton height={11} />
        <Skeleton width="70%" height={11} />
        <Skeleton width="50%" height={19} style={styles.skeletonPrice} />
      </View>
    </View>
  );
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  const { width: windowWidth } = useBreakpoint();
  const [gridWidth, setGridWidth] = useState(
    Math.min(windowWidth, layout.maxContentWidth) - spacing.lg * 2,
  );

  const columns = getColumns(gridWidth);
  const cardWidth = Math.floor((gridWidth - GAP * (columns - 1)) / columns);

  return (
    <View
      style={styles.grid}
      onLayout={(event) => setGridWidth(Math.floor(event.nativeEvent.layout.width))}
      accessibilityLabel={loading ? 'Cargando productos' : undefined}
    >
      {loading
        ? Array.from({ length: columns * 2 }, (_, index) => <ProductCardSkeleton key={index} width={cardWidth} />)
        : products.map((product) => <ProductCard key={product.id} product={product} width={cardWidth} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: GAP },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...cardShadow,
  },
  skeletonImage: { width: '100%', aspectRatio: 4 / 3 },
  skeletonBody: { padding: spacing.md, gap: spacing.sm },
  skeletonPrice: { marginTop: spacing.sm },
});
