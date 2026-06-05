import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useUserProfile } from '@/contexts/user-profile-context';



export default function IndexScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { isOnboardingComplete, isLoading: profileLoading } = useUserProfile();

  if (authLoading || profileLoading) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/setup" />;
  }

  return <Redirect href="/(tabs)/activities" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
