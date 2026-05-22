import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChallengeTimerProvider } from '@/contexts/challenge-timer-context';
import { UserProfileProvider } from '@/contexts/user-profile-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <UserProfileProvider>
        <ChallengeTimerProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="landing" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="activity-1" options={{ headerShown: false }} />
            <Stack.Screen name="activity-2" options={{ headerShown: false }} />
            <Stack.Screen name="activity-3" options={{ headerShown: false }} />
            <Stack.Screen name="activity-1/record-results" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
        </ChallengeTimerProvider>
      </UserProfileProvider>
    </SafeAreaProvider>
  );
}
