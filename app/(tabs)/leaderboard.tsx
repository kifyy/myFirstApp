import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LeaderboardScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Leaderboard</ThemedText>
      <ThemedText style={styles.subtitle}>
        Track top scores, compare progress, and see who is leading the challenges.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
