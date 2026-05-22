import { StyleSheet } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';

export default function LeaderboardScreen() {
  return (
    <AppScreen style={styles.container}>
      <ThemedText type="title">Leaderboard</ThemedText>
      <ThemedText style={styles.subtitle}>
        Track top scores, compare progress, and see who is leading the challenges.
      </ThemedText>
    </AppScreen>
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
