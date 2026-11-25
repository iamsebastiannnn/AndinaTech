import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { APP_CONFIG } from '@/config/app';
import { spacing } from '@/theme';

const SYMBOL = require('../../../assets/logo-simbolo.png');
const WORDMARK = require('../../../assets/logo-texto.png');
const FULL = require('../../../assets/logo-completo.png');

const SYMBOL_RATIO = 393 / 168;
const WORDMARK_RATIO = 701 / 132;
const FULL_RATIO = 960 / 511;

interface LogoProps {
  variant?: 'horizontal' | 'full';
  size?: number;
}

export function Logo({ variant = 'horizontal', size = 32 }: LogoProps) {
  if (variant === 'full') {
    return (
      <Image
        source={FULL}
        style={{ width: size * FULL_RATIO, height: size }}
        contentFit="contain"
        accessibilityLabel={APP_CONFIG.companyName}
      />
    );
  }

  const wordmarkHeight = Math.round(size * 0.76);
  return (
    <View style={styles.row} accessible accessibilityRole="image" accessibilityLabel={APP_CONFIG.companyName}>
      <Image source={SYMBOL} style={{ width: size * SYMBOL_RATIO, height: size }} contentFit="contain" />
      <Image
        source={WORDMARK}
        style={{ width: wordmarkHeight * WORDMARK_RATIO, height: wordmarkHeight }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
});
