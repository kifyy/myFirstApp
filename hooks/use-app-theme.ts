import { Colors, type ColorScheme, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useAppTheme(): {
  colorScheme: ColorScheme;
  isDark: boolean;
  colors: ThemeColors;
} {
  const scheme = useColorScheme() ?? 'light';
  const colorScheme: ColorScheme = scheme === 'dark' ? 'dark' : 'light';

  return {
    colorScheme,
    isDark: colorScheme === 'dark',
    colors: Colors[colorScheme],
  };
}
