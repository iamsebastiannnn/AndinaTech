import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Animated, Easing, Platform, View, type StyleProp, type ViewStyle } from 'react-native';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

const useNativeDriver = Platform.OS !== 'web';

export function Reveal({ children, delay = 0, style, contentStyle }: RevealProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const container = useRef<ComponentRef<typeof View>>(null);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 560,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    });
    const node = container.current as unknown as Element | null;
    if (Platform.OS === 'web' && node && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            animation.start();
            observer.disconnect();
          }
        },
        { threshold: 0.08 },
      );
      observer.observe(node);
      return () => {
        observer.disconnect();
        animation.stop();
      };
    }
    animation.start();
    return () => animation.stop();
  }, [progress, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <View ref={container} style={style}>
      <Animated.View style={[contentStyle, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>
    </View>
  );
}
