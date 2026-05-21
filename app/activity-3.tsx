import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function Activity3() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Hand Fan Challenge</ThemedText>
      <ThemedText style={styles.subtitle}>
        Hand Fan Challenge description.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  subtitle: { textAlign: 'center', lineHeight: 22, marginTop: 8 },
});
