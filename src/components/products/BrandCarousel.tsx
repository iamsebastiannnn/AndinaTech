import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { getBrandLogo, type BrandLogo } from '@/config/brands';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, radius } from '@/theme';

const PAUSE_MS = 1700;
const SLIDE_MS = 650;
const LOGO_HEIGHT = 30;
const useNativeDriver = Platform.OS !== 'web';

function BrandMark({ logo, slot }: { logo: BrandLogo; slot: number }) {
  const maxWidth = slot - 44;
  return (
    <View style={[styles.slot, { width: slot }]}>
      <Image
        source={logo.source}
        style={{
          width: Math.min(maxWidth, LOGO_HEIGHT * logo.ratio),
          height: Math.min(LOGO_HEIGHT, maxWidth / logo.ratio),
        }}
        contentFit="contain"
      />
    </View>
  );
}

export function BrandCarousel({ brands }: { brands: string[] }) {
  const { isDesktop, width } = useBreakpoint();
  const slot = isDesktop ? 190 : 140;
  const marks = useMemo(
    () =>
      brands
        .map((name) => ({ name, logo: getBrandLogo(name) }))
        .filter((mark): mark is { name: string; logo: BrandLogo } => mark.logo !== undefined),
    [brands],
  );
  const count = marks.length;
  const copies = Math.max(2, Math.ceil(width / Math.max(1, count * slot)) + 1);
  const track = useMemo(() => Array.from({ length: copies }, () => marks).flat(), [marks, copies]);
  const start = -count * slot;
  const [offset] = useState(() => new Animated.Value(start));

  useEffect(() => {
    if (count < 2) return;
    let step = 0;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    offset.setValue(start);

    const advance = () => {
      step += 1;
      Animated.timing(offset, {
        toValue: start + step * slot,
        duration: SLIDE_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver,
      }).start(({ finished }) => {
        if (!finished || stopped) return;
        if (step >= count) {
          step = 0;
          offset.setValue(start);
        }
        timer = setTimeout(advance, PAUSE_MS);
      });
    };

    timer = setTimeout(advance, PAUSE_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
      offset.stopAnimation();
    };
  }, [count, slot, start, offset]);

  if (count === 0) return null;

  return (
    <View
      style={styles.viewport}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Marcas presentes en el catálogo: ${marks.map((mark) => mark.name).join(', ')}`}
    >
      <Animated.View style={[styles.track, { width: track.length * slot, transform: [{ translateX: offset }] }]}>
        {track.map((mark, index) => (
          <BrandMark key={`${mark.name}-${index}`} logo={mark.logo} slot={slot} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingVertical: 26,
  },
  track: { flexDirection: 'row', alignItems: 'center' },
  slot: { height: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
});
