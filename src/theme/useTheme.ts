// src/theme/useTheme.ts
import { createContext } from 'react';
import { usePreferencesStore } from '@/src/store/preferencesStore';
import { lightTheme, darkTheme, type Theme } from './theme';

export const ThemeContext = createContext<Theme>(lightTheme);

/**
 * Returns the active theme tokens.
 * Reads from user's persisted colorMode (via preferencesStore)
 * so that the dark mode toggle in Profile → App Preferences is respected.
 *
 * Note: ThemeContext is kept for backward compatibility, but useTheme()
 * reads the store directly so no ThemeProvider wrapping is required for
 * entry-screen components.
 */
export function useTheme(): Theme {
  const colorMode = usePreferencesStore((s) => s.colorMode);
  return colorMode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Resolves the theme from the persisted colorMode preference.
 * Used internally by ThemeProvider.
 */
export function useResolvedTheme(): Theme {
  const colorMode = usePreferencesStore((s) => s.colorMode);
  return colorMode === 'dark' ? darkTheme : lightTheme;
}
