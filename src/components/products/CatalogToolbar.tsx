import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { SearchField } from '@/components/ui/SearchField';
import { ALL_CATEGORIES } from '@/hooks/useCatalog';
import { spacing } from '@/theme';
import type { Category } from '@/types';

interface CatalogToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  categories: Category[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  inline: boolean;
}

export function CatalogToolbar({
  query,
  onQueryChange,
  categories,
  categoryId,
  onCategoryChange,
  inline,
}: CatalogToolbarProps) {
  return (
    <View style={[styles.toolbar, inline && styles.toolbarInline]}>
      <View style={inline ? styles.searchInline : undefined}>
        <SearchField
          value={query}
          onChangeText={onQueryChange}
          placeholder="Buscar productos…"
          accessibilityLabel="Buscar productos"
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        accessibilityRole="radiogroup"
        accessibilityLabel="Filtrar por categoría"
        keyboardShouldPersistTaps="handled"
        style={styles.chipsScroll}
      >
        <Chip label="Todos" selected={categoryId === ALL_CATEGORIES} onPress={() => onCategoryChange(ALL_CATEGORIES)} />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            selected={categoryId === category.id}
            onPress={() => onCategoryChange(category.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: spacing.md },
  toolbarInline: { flexDirection: 'row', alignItems: 'center' },
  searchInline: { flex: 1, maxWidth: 460 },
  chipsScroll: { flexGrow: 0 },
  chips: { gap: spacing.sm, alignItems: 'center' },
});
