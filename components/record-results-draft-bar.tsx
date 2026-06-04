import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';

type RecordResultsDraftBarProps = {
  draft: { attemptNumber: number };
  onContinue: () => void;
  onDelete: () => void;
};

export function RecordResultsDraftBar({ draft, onContinue, onDelete }: RecordResultsDraftBarProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.text,
        },
      ]}>
      <ThemedText style={styles.label}>
        Attempt {draft.attemptNumber} in progress
      </ThemedText>
      <View style={styles.actions}>
        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [
            styles.continueButton,
            { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Text style={[styles.continueButtonText, { color: colors.onTint }]}>Continue</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            { backgroundColor: colors.dangerSurface, borderColor: colors.danger, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Text style={[styles.deleteButtonText, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  continueButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
