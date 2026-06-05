import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/auth-context';
import { ChallengeTimerProvider } from '@/contexts/challenge-timer-context';
import { UserProfileProvider } from '@/contexts/user-profile-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNavigationTheme } from '@/hooks/use-navigation-theme';
import { initDatabase } from '@/lib/db';

export const unstable_settings = {
  anchor: 'index',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const navigationTheme = useNavigationTheme();
  const backgroundColor = Colors[colorScheme === 'dark' ? 'dark' : 'light'].background;

  useEffect(() => {
    void initDatabase();
    void SystemUI.setBackgroundColorAsync(backgroundColor);
  }, [backgroundColor]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="setup" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="activity-1" options={{ headerShown: false }} />
        <Stack.Screen name="activity-2" options={{ headerShown: false }} />
        <Stack.Screen name="activity-3" options={{ headerShown: false }} />
        <Stack.Screen name="activity-4" options={{ headerShown: false }} />
        <Stack.Screen name="activity-1/record-results" options={{ headerShown: false }} />
        <Stack.Screen name="activity-2/record-results" options={{ headerShown: false }} />
        <Stack.Screen name="activity-3/record-results" options={{ headerShown: false }} />
        <Stack.Screen name="activity-4/record-results" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserProfileProvider>
          <ChallengeTimerProvider>
            <RootLayoutContent />
          </ChallengeTimerProvider>
        </UserProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
