/**
 * App color tokens for light and dark mode.
 * @see https://docs.expo.dev/develop/user-interface/color-themes/
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#4FC3F7';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    card: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceAlt: 'rgba(0, 0, 0, 0.03)',
    tint: tintColorLight,
    onTint: '#FFFFFF',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
    borderStrong: '#D0D5DD',
    inputBackground: '#FFFFFF',
    placeholder: '#687076',
    muted: '#6B7280',
    disabled: '#9CA3AF',
    overlay: 'rgba(0, 0, 0, 0.45)',
    headerMuted: '#6B7280',
    gold: '#F59E0B',
    success: '#4CAF50',
    successSurface: '#ECFDF5',
    danger: '#DC2626',
    dangerSurface: '#FEF2F2',
    warning: '#F2994A',
    timerBannerBg: '#FFF7ED',
    timerBannerBorder: '#F97316',
    timerBannerLabel: '#C2410C',
    timerBannerAccent: '#EA580C',
    timerBannerSubtext: '#9A3412',
    userBarBg: '#0a7ea4',
    userBarBorder: '#085f7a',
    userBarLabel: '#E0F2FE',
    userBarCaption: '#BAE6FD',
    parallaxHeader: '#A1CEDC',
    tabDot: '#F97316',
    tabDotBorder: '#FFFFFF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    card: '#1F2428',
    surface: '#1A1D21',
    surfaceAlt: 'rgba(255, 255, 255, 0.04)',
    tint: tintColorDark,
    onTint: '#11181C',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#374151',
    borderStrong: '#2F353A',
    inputBackground: '#1F2428',
    placeholder: '#9BA1A6',
    muted: '#9CA3AF',
    disabled: '#6B7280',
    overlay: 'rgba(0, 0, 0, 0.65)',
    headerMuted: '#9CA3AF',
    gold: '#FBBF24',
    success: '#66BB6A',
    successSurface: '#1B2E1F',
    danger: '#F87171',
    dangerSurface: '#3F1D1D',
    warning: '#FBBF24',
    timerBannerBg: '#3D2A14',
    timerBannerBorder: '#F97316',
    timerBannerLabel: '#FDBA74',
    timerBannerAccent: '#FB923C',
    timerBannerSubtext: '#FED7AA',
    userBarBg: '#0E7490',
    userBarBorder: '#0891B2',
    userBarLabel: '#E0F2FE',
    userBarCaption: '#BAE6FD',
    parallaxHeader: '#1D3D47',
    tabDot: '#F97316',
    tabDotBorder: '#151718',
  },
};

export type ThemeColors = typeof Colors.light;
export type ColorScheme = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
