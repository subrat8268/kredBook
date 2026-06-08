// src/theme/useTheme.ts
import { createContext, useContext } from 'react';
import { usePreferencesStore } from '@/src/store/preferencesStore';
import { lightTheme, darkTheme, type Theme } from './theme';

export const ThemeContext = createContext<Theme>(lightTheme);

/** Returns active theme tokens — reads user's persisted colorMode */
export function useTheme(): Theme {
  const colorMode = usePreferencesStore((s) => s.colorMode);
  return colorMode === 'dark' ? darkTheme : lightTheme;
}

/** For ThemeProvider only */
export function useResolvedTheme(): Theme {
  const colorMode = usePreferencesStore((s) => s.colorMode);
  return colorMode === 'dark' ? darkTheme : lightTheme;
}
