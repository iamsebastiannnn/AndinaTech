import { createContext, useContext } from 'react';
import { Animated } from 'react-native';

export interface ScrollContextValue {
  scrollY: Animated.Value;
  scrollTo: (y: number) => void;
}

const fallback: ScrollContextValue = { scrollY: new Animated.Value(0), scrollTo: () => {} };

export const ScrollContext = createContext<ScrollContextValue>(fallback);

export function useWorkAreaScroll(): ScrollContextValue {
  return useContext(ScrollContext);
}
