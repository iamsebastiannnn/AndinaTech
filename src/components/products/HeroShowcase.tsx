import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useWorkAreaScroll } from '@/contexts/ScrollContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, fonts, layout, radius, spacing, typography } from '@/theme';
import type { Product } from '@/types';

import { PriceBlock } from './PriceBlock';
import { ProductPhoto } from './ProductPhoto';

const HERO_TINTS = ['#E7EEF0', '#F3EAE2', '#E8EBF4', '#ECF1E8'];
const ROTATION_MS = 7000;
const useNativeDriver = Platform.OS !== 'web';

interface HeroShowcaseProps {
  products: Product[];
  onExplore: () => void;
}

interface HeroSlideProps {
  product: Product;
  tint: string;
  isDesktop: boolean;
  onExplore: () => void;
}

function HeroSlide({ product, tint, isDesktop, onExplore }: HeroSlideProps) {
  const router = useRouter();
  const { scrollY } = useWorkAreaScroll();
  const [enter] = useState(() => new Animated.Value(0));
  const [float] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const entrance = Animated.timing(enter, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    });
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(float, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    );
    entrance.start();
    floating.start();
    return () => {
      entrance.stop();
      floating.stop();
    };
  }, [enter, float]);

  const step = (from: number, to: number) => ({
    opacity: enter.interpolate({ inputRange: [from, to], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [
      { translateY: enter.interpolate({ inputRange: [from, to], outputRange: [18, 0], extrapolate: 'clamp' }) },
    ],
  });

  const photoEntrance = {
    opacity: enter.interpolate({ inputRange: [0, 0.7], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
      { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) },
    ],
  };
  const floatStyle = { transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] }) }] };
  const parallax = {
    transform: [
      { translateY: scrollY.interpolate({ inputRange: [0, 500], outputRange: [0, -34], extrapolate: 'clamp' }) },
    ],
  };

  const openProduct = () => router.push({ pathname: '/product/[sku]', params: { sku: product.sku } });

  return (
    <View style={[styles.slide, isDesktop && styles.slideDesktop]}>
      <View style={[styles.copy, isDesktop && styles.copyDesktop]}>
        <Animated.Text style={[styles.eyebrow, step(0, 0.4)]}>
          {[product.categoryName, product.brand].filter(Boolean).join(' · ')}
        </Animated.Text>
        <Animated.Text
          style={[styles.headline, isDesktop && styles.headlineDesktop, step(0.1, 0.6)]}
          accessibilityRole="header"
        >
          {product.tagline ?? product.name}
        </Animated.Text>
        <Animated.Text style={[styles.name, step(0.22, 0.72)]} numberOfLines={2}>
          {product.name}
        </Animated.Text>
        <Animated.View style={[styles.priceRow, step(0.34, 0.84)]}>
          <PriceBlock price={product.price} previousPrice={product.previousPrice} size="lg" />
        </Animated.View>
        <Animated.View style={[styles.actions, step(0.46, 1)]}>
          <Pressable
            onPress={openProduct}
            accessibilityRole="link"
            accessibilityLabel={`Ver ${product.name}`}
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
          >
            <Text style={styles.primaryActionText}>Ver producto</Text>
            <View style={styles.primaryActionIcon}>
              <Ionicons name="arrow-forward" size={16} color={colors.ink} />
            </View>
          </Pressable>
          <Pressable
            onPress={onExplore}
            accessibilityRole="button"
            accessibilityLabel="Explorar todo el catálogo"
            style={({ pressed }) => [styles.secondaryAction, !isDesktop && styles.secondaryActionCompact, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryActionText}>Explorar catálogo</Text>
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View style={[styles.photoColumn, isDesktop && styles.photoColumnDesktop, parallax]}>
        <Animated.View style={[styles.photoFill, floatStyle]}>
          <Animated.View style={[styles.photoFill, photoEntrance]}>
            <Pressable onPress={openProduct} accessibilityRole="link" accessibilityLabel={`Ver ${product.name}`} style={styles.photoFill}>
              <ProductPhoto
                image={product.images[0]}
                size="full"
                tint={tint}
                padding={0}
                label={product.name}
                priority
                style={styles.photoFill}
              />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export function HeroShowcase({ products, onExplore }: HeroShowcaseProps) {
  const { isDesktop } = useBreakpoint();
  const [index, setIndex] = useState(0);
  const [tint] = useState(() => new Animated.Value(0));
  const count = products.length;
  const current = count > 0 ? index % count : 0;

  useEffect(() => {
    if (count < 2) return;
    const timer = setTimeout(() => setIndex((value) => (value + 1) % count), ROTATION_MS);
    return () => clearTimeout(timer);
  }, [count, index]);

  useEffect(() => {
    Animated.timing(tint, { toValue: current, duration: 260, useNativeDriver: false }).start();
  }, [tint, current]);

  if (count === 0) return null;

  const backgroundColor =
    count > 1
      ? tint.interpolate({
          inputRange: products.map((_, position) => position),
          outputRange: products.map((_, position) => HERO_TINTS[position % HERO_TINTS.length]),
        })
      : HERO_TINTS[0];

  return (
    <Animated.View style={[styles.hero, isDesktop && styles.heroDesktop, { backgroundColor }]}>
      <HeroSlide
        key={products[current].sku}
        product={products[current]}
        tint={HERO_TINTS[current % HERO_TINTS.length]}
        isDesktop={isDesktop}
        onExplore={onExplore}
      />
      {count > 1 ? (
        <View style={[styles.controls, isDesktop && styles.controlsDesktop]} accessibilityRole="tablist">
          {products.map((product, position) => (
            <Pressable
              key={product.sku}
              onPress={() => setIndex(position)}
              hitSlop={10}
              accessibilityRole="tab"
              accessibilityLabel={`Destacado ${position + 1} de ${count}: ${product.name}`}
              accessibilityState={{ selected: position === current }}
              style={[styles.dot, position === current && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, overflow: 'hidden', paddingBottom: spacing.xl },
  heroDesktop: { minHeight: 500, paddingBottom: 0 },
  slide: { padding: spacing.xl, gap: spacing.xl },
  slideDesktop: { flexDirection: 'row', alignItems: 'center', padding: 56, gap: spacing.xxl, minHeight: 500 },
  copy: { gap: spacing.md },
  copyDesktop: { flex: 1, maxWidth: 540, gap: spacing.lg },
  eyebrow: { ...typography.eyebrow, color: colors.accent },
  headline: { fontFamily: fonts.display, fontSize: 36, lineHeight: 39, letterSpacing: -1.2, color: colors.ink },
  headlineDesktop: { fontSize: 62, lineHeight: 64, letterSpacing: -2.4 },
  name: { ...typography.bodyMuted, maxWidth: 460 },
  priceRow: { marginTop: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  primaryAction: {
    minHeight: layout.minTouchSize + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.xl,
    paddingRight: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  primaryActionText: { color: colors.onInk, fontSize: 15, fontWeight: '700' },
  primaryActionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    minHeight: layout.minTouchSize + 4,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(11, 31, 37, 0.25)',
  },
  secondaryActionCompact: { borderWidth: 0, paddingHorizontal: spacing.xs },
  secondaryActionText: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  photoColumn: { height: 220 },
  photoColumnDesktop: { flex: 1, height: 390 },
  photoFill: { flex: 1 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  controlsDesktop: { position: 'absolute', left: 56, bottom: spacing.xl, justifyContent: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(11, 31, 37, 0.2)' },
  dotActive: { width: 28, backgroundColor: colors.ink },
});
