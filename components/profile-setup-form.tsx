import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { YEAR_LEVELS, type UserProfile, type YearLevel } from '@/constants/user-profile';
import { useAppTheme } from '@/hooks/use-app-theme';

type ProfileSetupFormProps = {
  title?: string;
  subheading?: string;
  submitLabel?: string;
  initialProfile?: UserProfile | null;
  onSubmit: (profile: UserProfile) => Promise<void>;
  containerStyle?: StyleProp<ViewStyle>;
};

export function ProfileSetupForm({
  title = 'STEMM Lab',
  subheading = "Welcome, young scientist! Let's set up your profile",
  submitLabel = 'Start Experimenting!',
  initialProfile,
  onSubmit,
  containerStyle,
}: ProfileSetupFormProps) {
  const { colors } = useAppTheme();
  const [teamName, setTeamName] = useState(initialProfile?.teamName ?? '');
  const [firstName, setFirstName] = useState(initialProfile?.firstName ?? '');
  const [yearLevel, setYearLevel] = useState<YearLevel | ''>(initialProfile?.yearLevel ?? '');
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormComplete =
    teamName.trim().length > 0 && firstName.trim().length > 0 && yearLevel !== '';

  const handleSubmit = async () => {
    if (!isFormComplete || yearLevel === '') {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        teamName: teamName.trim(),
        firstName: firstName.trim(),
        yearLevel,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.form, containerStyle]}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={styles.subheading}>{subheading}</ThemedText>

      <ThemedText style={styles.label}>Team Name</ThemedText>
      <TextInput
        value={teamName}
        onChangeText={setTeamName}
        placeholder="Enter your team name"
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          {
            borderColor: colors.borderStrong,
            backgroundColor: colors.inputBackground,
            color: colors.text,
          },
        ]}
      />

      <ThemedText style={styles.label}>First Name</ThemedText>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Enter your first name"
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          {
            borderColor: colors.borderStrong,
            backgroundColor: colors.inputBackground,
            color: colors.text,
          },
        ]}
      />

      <ThemedText style={styles.label}>Year Level</ThemedText>
      <Pressable
        onPress={() => setYearPickerVisible(true)}
        style={({ pressed }) => [
          styles.input,
          styles.selectInput,
          {
            borderColor: colors.borderStrong,
            backgroundColor: colors.inputBackground,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <ThemedText style={[styles.selectText, !yearLevel && { color: colors.placeholder }]}>
          {yearLevel || 'Select your year level'}
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={() => {
          void handleSubmit();
        }}
        disabled={!isFormComplete || isSubmitting}
        style={({ pressed }) => [
          styles.submitButton,
          {
            backgroundColor: !isFormComplete || isSubmitting ? colors.disabled : colors.tint,
          },
          { opacity: pressed && isFormComplete ? 0.85 : 1 },
        ]}>
        <ThemedText style={[styles.submitButtonText, { color: colors.onTint }]}>{submitLabel}</ThemedText>
      </Pressable>

      <Modal
        visible={yearPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setYearPickerVisible(false)}>
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
          onPress={() => setYearPickerVisible(false)}>
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: colors.inputBackground, borderColor: colors.borderStrong },
            ]}>
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
                  { borderColor: colors.borderStrong, opacity: pressed ? 0.85 : 1 },
                ]}>
                <ThemedText>{level}</ThemedText>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    gap: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 26,
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
  selectInput: {
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 16,
  },
  submitButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
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
