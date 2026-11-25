import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CategorySummary } from '@/hooks/useCatalog';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, fonts, radius, spacing, stageTints } from '@/theme';

import { ProductPhoto } from './ProductPhoto';

interface CategoryTilesProps {
  categories: CategorySummary[];
  onSelect: (categoryId: string) => void;
}

interface TileProps {
  category: CategorySummary;
  tint: string;
  onPress: () => void;
  fluid: boolean;
}

function Tile({ category, tint, onPress, fluid }: TileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${category.name}: ${category.count} productos`}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.tile,
        fluid ? styles.tileFluid : styles.tileFixed,
        { backgroundColor: tint },
        (pressed || hovered) && styles.tileActive,
      ]}
    >
      <View style={styles.tileHeader}>
        <View style={styles.tileTexts}>
          <Text style={styles.tileName} numberOfLines={2}>
            {category.name}
          </Text>
          <Text style={styles.tileCount}>
            {category.count} {category.count === 1 ? 'producto' : 'productos'}
          </Text>
        </View>
        <View style={styles.tileArrow}>
          <Ionicons name="arrow-forward" size={14} color={colors.ink} />
        </View>
      </View>
      <ProductPhoto
        image={category.cover.images[0]}
        tint={tint}
        padding={0}
        label={category.cover.name}
        style={styles.tilePhoto}
      />
    </Pressable>
  );
}

export function CategoryTiles({ categories, onSelect }: CategoryTilesProps) {
  const { isDesktop } = useBreakpoint();
  const tiles = categories.map((category, index) => (
    <Tile
      key={category.id}
      category={category}
      tint={stageTints[index % stageTints.length]}
      onPress={() => onSelect(category.id)}
      fluid={isDesktop}
    />
  ));

  if (isDesktop) return <View style={styles.row}>{tiles}</View>;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroller}
      style={styles.bleed}
    >
      {tiles}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  bleed: { marginHorizontal: -spacing.lg },
  scroller: { gap: spacing.md, paddingHorizontal: spacing.lg },
  tile: { borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  tileFixed: { width: 172, height: 200 },
  tileFluid: { flex: 1, height: 220 },
  tileActive: { opacity: 0.88 },
  tileHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  tileTexts: { flex: 1, minWidth: 0 },
  tileName: { fontFamily: fonts.heading, fontSize: 14.5, lineHeight: 18, color: colors.ink },
  tileCount: { fontSize: 12, lineHeight: 16, color: colors.textMuted },
  tileArrow: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilePhoto: { flex: 1 },
});
