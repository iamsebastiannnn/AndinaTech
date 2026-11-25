import { StyleSheet, Text, View } from 'react-native';

import { CatalogHeading } from '@/components/products/CatalogHeading';
import { CatalogToolbar } from '@/components/products/CatalogToolbar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { StateMessage } from '@/components/ui/StateMessage';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageTitle } from '@/hooks/usePageTitle';
import { spacing, typography } from '@/theme';

export default function CatalogScreen() {
  usePageTitle('Catálogo');
  const { isDesktop } = useBreakpoint();
  const catalog = useCatalog();

  function renderResults() {
    if (catalog.isLoading) return <ProductGrid products={[]} loading />;

    if (catalog.error) {
      return (
        <StateMessage
          tone="error"
          icon="cloud-offline-outline"
          title="No pudimos mostrar el catálogo"
          description={catalog.error}
          actionLabel="Reintentar"
          actionIcon="refresh"
          onAction={catalog.reload}
        />
      );
    }

    if (catalog.totalProducts === 0) {
      return (
        <StateMessage
          icon="cube-outline"
          title="Aún no hay productos en el catálogo"
          description="Pronto publicaremos nuestros productos de tecnología y hogar."
          actionLabel="Actualizar"
          actionIcon="refresh"
          onAction={catalog.reload}
        />
      );
    }

    if (catalog.products.length === 0) {
      return (
        <StateMessage
          icon="search-outline"
          title="No encontramos productos"
          description={
            catalog.query.trim()
              ? `Ningún producto coincide con “${catalog.query.trim()}”. Prueba con otra palabra o cambia la categoría.`
              : 'No hay productos en esta categoría por ahora.'
          }
          actionLabel="Ver todo el catálogo"
          actionIcon="close-circle-outline"
          onAction={catalog.clearFilters}
        />
      );
    }

    return <ProductGrid products={catalog.products} />;
  }

  const showCount = !catalog.isLoading && !catalog.error && catalog.products.length > 0;

  return (
    <View style={styles.page}>
      <CatalogHeading />
      <CatalogToolbar
        inline={isDesktop}
        query={catalog.query}
        onQueryChange={catalog.setQuery}
        categories={catalog.categories}
        categoryId={catalog.categoryId}
        onCategoryChange={catalog.setCategoryId}
      />
      {showCount ? (
        <Text style={styles.count} accessibilityLiveRegion="polite">
          {catalog.products.length === 1 ? '1 producto' : `${catalog.products.length} productos`}
          {catalog.hasFilters ? ` de ${catalog.totalProducts}` : ''}
        </Text>
      ) : null}
      {renderResults()}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.md },
  count: { ...typography.small, marginBottom: -spacing.xs },
});
