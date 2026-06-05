import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { ProfileSetupForm } from '@/components/profile-setup-form';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useUserProfile } from '@/contexts/user-profile-context';

export default function SetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isOnboardingComplete, saveProfile } = useUserProfile();

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (isOnboardingComplete) {
    return <Redirect href="/(tabs)/activities" />;
  }

  const handleSubmit = async (nextProfile: Parameters<typeof saveProfile>[0]) => {
    if (!user?.email) {
      return;
    }
    await saveProfile(nextProfile);
    router.replace('/(tabs)/activities');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.heroImage}
            contentFit="contain"
          />
          <ProfileSetupForm
            subheading="Tell us your team and year level to link this account"
            submitLabel="Save and continue"
            initialProfile={profile}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroImage: {
    width: 160,
    height: 160,
    marginBottom: 8,
  },
});
