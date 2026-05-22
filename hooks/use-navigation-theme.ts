import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { useMemo } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useNavigationTheme(): Theme {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return useMemo(() => {
    const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: palette.tint,
        background: palette.background,
        card: palette.card,
        text: palette.text,
        border: palette.border,
        notification: palette.tint,
      },
    };
  }, [colorScheme, palette]);
}
