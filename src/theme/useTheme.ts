// src/theme/useTheme.ts
import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, type Theme } from './theme';

export const ThemeContext = createContext<Theme>(lightTheme);

/** Returns the active theme tokens inside any component */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** Resolves light/dark from system preference — use in root _layout.tsx */
export function useResolvedTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
