import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/theme';
import type { ProductImage } from '@/types';

interface ProductPhotoProps {
  image: ProductImage | undefined;
  size?: 'thumb' | 'full';
  tint?: string;
  padding?: number;
  label: string;
  priority?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ProductPhoto({
  image,
  size = 'thumb',
  tint = colors.stage,
  padding = spacing.lg,
  label,
  priority = false,
  style,
}: ProductPhotoProps) {
  const [failed, setFailed] = useState(false);
  const uri = image ? (size === 'thumb' ? image.thumb : image.url) : null;
  const blends = image?.background === 'blanco';

  return (
    <View style={[styles.stage, { backgroundColor: tint, padding }, style]}>
      {uri && !failed ? (
        <View style={[styles.fill, blends && styles.multiply]}>
          <Image
            source={{ uri }}
            style={styles.fill}
            contentFit="contain"
            transition={220}
            cachePolicy="memory-disk"
            priority={priority ? 'high' : 'normal'}
            accessibilityLabel={label}
            onError={() => setFailed(true)}
          />
        </View>
      ) : (
        <View style={styles.fallback} accessible accessibilityLabel="Imagen no disponible">
          <Ionicons name="image-outline" size={28} color={colors.textDisabled} />
          <Text style={styles.fallbackText}>Imagen no disponible</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { overflow: 'hidden' },
  fill: { flex: 1, width: '100%', height: '100%' },
  multiply: { mixBlendMode: 'multiply' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  fallbackText: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});
