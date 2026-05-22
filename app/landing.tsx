import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { YEAR_LEVELS, type YearLevel } from '@/constants/user-profile';
import { useUserProfile } from '@/contexts/user-profile-context';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function LandingScreen() {
  const router = useRouter();
  const { saveProfile } = useUserProfile();
  const { colors } = useAppTheme();
  const [teamName, setTeamName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [yearLevel, setYearLevel] = useState<YearLevel | ''>('');
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const borderColor = colors.borderStrong;
  const inputBackground = colors.inputBackground;
  const placeholderColor = colors.placeholder;
  const textColor = colors.text;

  const isFormComplete =
    teamName.trim().length > 0 && firstName.trim().length > 0 && yearLevel !== '';

  const handleStart = async () => {
    if (!isFormComplete || yearLevel === '') {
      return;
    }

    setIsSubmitting(true);
    try {
      await saveProfile({
        teamName: teamName.trim(),
        firstName: firstName.trim(),
        yearLevel,
      });
      router.replace('/(tabs)/activities');
    } catch (error) {
      console.error('Error saving profile:', error);
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
            Welcome, young scientist! Let&apos;s get started
          </ThemedText>

          <View style={styles.form}>
            <ThemedText style={styles.label}>Team Name</ThemedText>
            <TextInput
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Enter your team name"
              placeholderTextColor={placeholderColor}
              style={[styles.input, { borderColor, backgroundColor: inputBackground, color: textColor }]}
            />

            <ThemedText style={styles.label}>First Name</ThemedText>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={placeholderColor}
              style={[styles.input, { borderColor, backgroundColor: inputBackground, color: textColor }]}
            />

            <ThemedText style={styles.label}>Year Level</ThemedText>
            <Pressable
              onPress={() => setYearPickerVisible(true)}
              style={({ pressed }) => [
                styles.input,
                styles.selectInput,
                { borderColor, backgroundColor: inputBackground, opacity: pressed ? 0.85 : 1 },
              ]}>
              <ThemedText style={[styles.selectText, !yearLevel && { color: placeholderColor }]}>
                {yearLevel || 'Select your year level'}
              </ThemedText>
            </Pressable>
          </View>

          <Pressable
            onPress={handleStart}
            disabled={!isFormComplete || isSubmitting}
            style={({ pressed }) => [
              styles.startButton,
              {
                backgroundColor: !isFormComplete || isSubmitting ? colors.disabled : colors.tint,
              },
              { opacity: pressed && isFormComplete ? 0.85 : 1 },
            ]}>
            <ThemedText style={[styles.startButtonText, { color: colors.onTint }]}>
              Start Experimenting!
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={yearPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setYearPickerVisible(false)}>
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
          onPress={() => setYearPickerVisible(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: inputBackground, borderColor }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Select your year level
            </ThemedText>
            {YEAR_LEVELS.map((level) => (
              <Pressable
                key={level}
                onPress={() => {
                  setYearLevel(level);
                  setYearPickerVisible(false);
                }}
                style={({ pressed }) => [
                  styles.yearOption,
                  { borderColor, opacity: pressed ? 0.85 : 1 },
                ]}>
                <ThemedText>{level}</ThemedText>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
  },
  heroImage: {
    width: 180,
    height: 180,
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
    marginBottom: 28,
  },
  form: {
    width: '100%',
    gap: 8,
    marginBottom: 24,
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
  selectInput: {
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 16,
  },
  startButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  modalTitle: {
    marginBottom: 4,
  },
  yearOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});
