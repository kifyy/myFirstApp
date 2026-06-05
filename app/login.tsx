import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';

function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    default:
      return 'Could not sign in. Check your details and try again.';
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.replace('/');
    } catch (error) {
      Alert.alert(isSignUp ? 'Sign up failed' : 'Sign in failed', getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
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

          <ThemedText type="title" style={styles.title}>
            STEMM Lab
          </ThemedText>
          <ThemedText style={styles.subheading}>
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </ThemedText>

          <View style={styles.form}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@school.edu"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  borderColor: colors.borderStrong,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
            />

            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              style={[
                styles.input,
                {
                  borderColor: colors.borderStrong,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
            />
          </View>

          <Pressable
            onPress={() => {
              void handleSubmit();
            }}
            disabled={!canSubmit || isSubmitting}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: !canSubmit || isSubmitting ? colors.disabled : colors.tint,
              },
              { opacity: pressed && canSubmit ? 0.85 : 1 },
            ]}>
            <ThemedText style={[styles.primaryButtonText, { color: colors.onTint }]}>
              {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setIsSignUp((current) => !current)}
            style={({ pressed }) => [styles.switchButton, { opacity: pressed ? 0.7 : 1 }]}>
            <ThemedText style={{ color: colors.tint }}>
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </ThemedText>
          </Pressable>
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
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 24,
  },
  form: {
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  switchButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
