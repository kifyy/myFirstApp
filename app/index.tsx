import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { useUserProfile } from '@/contexts/user-profile-context';

export default function IndexScreen() {
  const { isOnboardingComplete, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (isOnboardingComplete) {
    return <Redirect href="/(tabs)/activities" />;
  }

  return <Redirect href="/landing" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
