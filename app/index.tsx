import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CatalogToolbar } from '@/components/products/CatalogToolbar';
import { CategoryTiles } from '@/components/products/CategoryTiles';
import { EditorialBand } from '@/components/products/EditorialBand';
import { FeaturedRail } from '@/components/products/FeaturedRail';
import { HeroShowcase } from '@/components/products/HeroShowcase';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SpotlightTile } from '@/components/products/SpotlightTile';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateMessage } from '@/components/ui/StateMessage';
import { useWorkAreaScroll } from '@/contexts/ScrollContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useCatalog } from '@/hooks/useCatalog';
import { usePageTitle } from '@/hooks/usePageTitle';
import { radius, spacing, typography } from '@/theme';

export default function CatalogScreen() {
  usePageTitle('Tecnología y hogar');
  const { isDesktop } = useBreakpoint();
  const { scrollTo } = useWorkAreaScroll();
  const catalog = useCatalog();
  const catalogOffset = useRef(0);

  const goToCatalog = useCallback(() => scrollTo(catalogOffset.current - spacing.md), [scrollTo]);

  const { setCategoryId, setQuery } = catalog;
  const openCategory = useCallback(
    (categoryId: string) => {
      setQuery('');
      setCategoryId(categoryId);
      goToCatalog();
    },
    [setCategoryId, setQuery, goToCatalog],
  );

  const openCategoryBySlug = (slug: string) => {
    const category = catalog.categories.find((item) => item.slug === slug);
    if (category) openCategory(category.id);
    else goToCatalog();
  };

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
          description="Pronto publicaremos nuestra selección de tecnología y hogar."
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

  const hasContent = !catalog.isLoading && !catalog.error && catalog.totalProducts > 0;
  const smartHome = catalog.bySlug('hogar-inteligente').filter((product) => product.isFeatured);
  const gamingLead = catalog.bySlug('gaming').find((product) => product.isFeatured);
  const screenLead = catalog.bySlug('pantallas').find((product) => product.isFeatured && product.heroOrder === null);
  const showCount = hasContent && catalog.products.length > 0;

  return (
    <View style={styles.page}>
      {catalog.isLoading ? (
        <Skeleton height={isDesktop ? 500 : 460} borderRadius={radius.xl} />
      ) : hasContent ? (
        <HeroShowcase products={catalog.heroes} onExplore={goToCatalog} />
      ) : null}

      {hasContent ? (
        <>
          <Reveal contentStyle={styles.section}>
            <SectionHeading eyebrow="Explora" title="Compra por categoría" />
            <CategoryTiles categories={catalog.categories} onSelect={openCategory} />
          </Reveal>

          {catalog.featured.length > 0 ? (
            <Reveal contentStyle={styles.section}>
              <SectionHeading
                eyebrow="Selección Andina"
                title="Destacados de la temporada"
                description="Equipos elegidos por nuestro equipo en cada categoría."
              />
              <FeaturedRail products={catalog.featured} />
            </Reveal>
          ) : null}

          {smartHome.length > 0 ? (
            <Reveal>
              <EditorialBand
                eyebrow="Hogar inteligente"
                title="Tu casa responde cuando la llamas"
                description="Asistentes de voz, pantallas inteligentes y limpieza automática que trabajan juntos."
                actionLabel="Ver hogar inteligente"
                onAction={() => openCategoryBySlug('hogar-inteligente')}
                products={smartHome}
              />
            </Reveal>
          ) : null}

          {gamingLead || screenLead ? (
            <Reveal contentStyle={[styles.spotlights, isDesktop && styles.spotlightsDesktop]}>
              {screenLead ? (
                <SpotlightTile
                  eyebrow="Pantallas"
                  title="Más pantalla, más detalle"
                  product={screenLead}
                  tint="#E8EBF4"
                  wide={isDesktop}
                />
              ) : null}
              {gamingLead ? (
                <SpotlightTile
                  eyebrow="Gaming"
                  title="Juega en serio"
                  product={gamingLead}
                  tint="#F3EAE2"
                  wide={isDesktop}
                />
              ) : null}
            </Reveal>
          ) : null}
        </>
      ) : null}

      <View
        style={styles.section}
        onLayout={(event) => {
          catalogOffset.current = event.nativeEvent.layout.y;
        }}
      >
        <SectionHeading
          eyebrow="Catálogo"
          title="Todos los productos"
          description="Busca por nombre, marca o referencia y filtra por categoría."
        />
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
        {hasContent ? (
          <Text style={styles.disclaimer}>
            Precios y disponibilidad de referencia, consultados en la fecha indicada en cada producto. Pueden cambiar sin
            previo aviso.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.section },
  section: { gap: spacing.lg },
  spotlights: { gap: spacing.lg },
  spotlightsDesktop: { flexDirection: 'row' },
  count: { ...typography.small, marginBottom: -spacing.sm },
  disclaimer: { ...typography.caption, marginTop: spacing.xs },
});
