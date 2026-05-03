// src/theme/ThemeProvider.tsx
import React from 'react';
import { ThemeContext, useResolvedTheme } from './useTheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useResolvedTheme();
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
