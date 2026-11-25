import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PriceBlock } from '@/components/products/PriceBlock';
import { ProductPhoto } from '@/components/products/ProductPhoto';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateMessage } from '@/components/ui/StateMessage';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useProduct } from '@/hooks/useProduct';
import { colors, fonts, layout, radius, spacing, typography } from '@/theme';
import { formatDateTime } from '@/utils/format';

export default function ProductScreen() {
  const { sku } = useLocalSearchParams<{ sku: string }>();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();
  const { product, isLoading, error, reload } = useProduct(sku);
  const [selected, setSelected] = useState(0);
  usePageTitle(product?.name ?? 'Producto');

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const backLink = (
    <Pressable
      onPress={goBack}
      accessibilityRole="link"
      accessibilityLabel="Volver al catálogo"
      style={({ pressed }) => [styles.back, pressed && styles.pressed]}
    >
      <Ionicons name="arrow-back" size={18} color={colors.ink} />
      <Text style={styles.backText}>Catálogo</Text>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.page}>
        {backLink}
        <View style={[styles.layout, isDesktop && styles.layoutDesktop]}>
          <Skeleton height={isDesktop ? 520 : 320} borderRadius={radius.xl} style={isDesktop ? styles.galleryDesktop : undefined} />
          <View style={[styles.info, isDesktop && styles.infoDesktop]}>
            <Skeleton width="40%" height={12} />
            <Skeleton width="90%" height={28} />
            <Skeleton width="70%" height={28} />
            <Skeleton width="50%" height={34} />
            <Skeleton height={14} />
            <Skeleton width="80%" height={14} />
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.page}>
        {backLink}
        <StateMessage
          tone="error"
          icon="cloud-offline-outline"
          title="No pudimos mostrar el producto"
          description={error}
          actionLabel="Reintentar"
          actionIcon="refresh"
          onAction={reload}
        />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.page}>
        {backLink}
        <StateMessage
          icon="cube-outline"
          title="Este producto ya no está en el catálogo"
          description="Puede que la referencia haya cambiado o se haya retirado."
          actionLabel="Ir al catálogo"
          actionIcon="grid-outline"
          onAction={() => router.replace('/')}
        />
      </View>
    );
  }

  const soldOut = product.stock <= 0;
  const current = product.images[Math.min(selected, product.images.length - 1)];
  const facts = [
    product.brand ? { label: 'Marca', value: product.brand } : null,
    product.model ? { label: 'Referencia', value: product.model } : null,
    ...product.specs,
    { label: 'Código', value: product.sku },
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <View style={styles.page}>
      {backLink}
      <View style={[styles.layout, isDesktop && styles.layoutDesktop]}>
        <Reveal style={isDesktop ? styles.galleryDesktop : undefined}>
          <ProductPhoto
            key={current?.url}
            image={current}
            size="full"
            tint="#EEF2F3"
            padding={isDesktop ? 48 : spacing.xl}
            label={product.name}
            priority
            style={[styles.mainPhoto, isDesktop && styles.mainPhotoDesktop]}
          />
          {product.images.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
              {product.images.map((image, index) => (
                <Pressable
                  key={image.url}
                  onPress={() => setSelected(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver imagen ${index + 1} de ${product.images.length}`}
                  accessibilityState={{ selected: index === selected }}
                  style={[styles.thumb, index === selected && styles.thumbSelected]}
                >
                  <ProductPhoto image={image} tint={colors.surface} padding={6} label="" style={styles.thumbPhoto} />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </Reveal>

        <Reveal delay={120} style={[styles.info, isDesktop && styles.infoDesktop]}>
          <View style={styles.infoInner}>
            <Text style={styles.eyebrow}>{[product.categoryName, product.brand].filter(Boolean).join(' · ')}</Text>
            <Text style={[styles.name, isDesktop && styles.nameDesktop]} accessibilityRole="header">
              {product.name}
            </Text>
            <PriceBlock price={product.price} previousPrice={product.previousPrice} size="lg" />
            <View style={styles.availability}>
              <View style={[styles.dot, { backgroundColor: soldOut ? colors.textDisabled : colors.success }]} />
              <Text style={[styles.availabilityText, soldOut && styles.availabilityOut]}>
                {soldOut ? 'Agotado' : 'Disponible'}
              </Text>
            </View>
            <Text style={styles.description}>{product.description}</Text>

            <View style={styles.facts}>
              <Text style={styles.factsTitle}>Ficha técnica</Text>
              {facts.map((fact) => (
                <View key={fact.label} style={styles.fact}>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                  <Text style={styles.factValue} selectable>
                    {fact.value}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.note}>
              {product.checkedAt
                ? `Precio y disponibilidad de referencia (consulta: ${formatDateTime(product.checkedAt)}). `
                : 'Precio y disponibilidad de referencia. '}
              Pueden cambiar sin previo aviso. Las marcas pertenecen a sus respectivos fabricantes.
            </Text>
          </View>
        </Reveal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.lg },
  back: {
    alignSelf: 'flex-start',
    minHeight: layout.minTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  backText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  pressed: { opacity: 0.6 },
  layout: { gap: spacing.xl },
  layoutDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 48 },
  galleryDesktop: { flex: 6 },
  mainPhoto: { width: '100%', aspectRatio: 1, borderRadius: radius.xl },
  mainPhotoDesktop: { aspectRatio: 1.15 },
  thumbs: { gap: spacing.sm, paddingTop: spacing.md },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  thumbSelected: { borderColor: colors.ink },
  thumbPhoto: { flex: 1 },
  info: {},
  infoDesktop: { flex: 5 },
  infoInner: { gap: spacing.md },
  eyebrow: { ...typography.eyebrow, color: colors.accent },
  name: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.5, color: colors.ink },
  nameDesktop: { fontSize: 32, lineHeight: 38, letterSpacing: -0.9 },
  availability: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  availabilityText: { fontSize: 13, fontWeight: '700', color: colors.success },
  availabilityOut: { color: colors.textMuted },
  description: { ...typography.body, color: colors.textMuted },
  facts: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  factsTitle: { ...typography.subtitle, paddingVertical: spacing.sm },
  fact: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  factLabel: { ...typography.small, flex: 2 },
  factValue: { ...typography.small, flex: 3, color: colors.text, fontWeight: '600' },
  note: { ...typography.caption },
});
